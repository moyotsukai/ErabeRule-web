<template>
    <div id="room-outline" class="body-padding">
        <div class="content">
            <div v-if="searchingView" class="result-section">
                <p class="primary-text">検索中...</p>
            </div>

            <div v-if="roomOutlineView" class="result-section">
                <p class="text-left supporting-text">タイトル</p>
                <p class="text-left primary-text">{{ title }}</p>
                <button v-on:click="goToVoteButtonClicked" class="primary-button">投票する</button>
            </div>

            <div v-if="noResultsView" class="result-section">
                <p class="primary-text">"{{ enteredTitle }}":<br>該当なし</p>
            </div>

            <div v-if="isClosed" class="result-section">
                <p class="primary-text">"{{ enteredTitle }}"は非公開です。</p>
            </div>

            <div v-if="resultView" class="result-section text-right">
                <div class="small-loading-section">
                    <p class="supporting-text inlineblock margin-zero-p">リアルタイムで反映中</p>
                    <div class="small-loading inlineblock"></div>
                </div>
                <div class="result-small-section">
                    <p class="text-left supporting-text">タイトル</p>
                    <p class="text-left primary-text">{{ resultTitle }}</p>
                </div>
                <div class="result-small-section">
                    <p class="text-left supporting-text">結果</p>
                    <ul v-for="(results, index) in arrayOfResults">
                        <p v-if="arrayOfResults.length > 1" class="text-left supporting-text">{{ index + 1 }}つ目の可能性</p>
                        <li v-for="result in results" class="text-left primary-text results-table">
                            <span class="rank-label">{{ result.rank }}</span><span class="optionname-label">{{ result.name }}</span><span v-if="showRankLabel" class="score-label">{{ result.score }}</span>
                        </li>
                        <p class="text-right supporting-text">{{ numOfVoters }}人が投票済み</p>
                    </ul>
                </div>
                <div class="result-small-section">
                    <p class="text-left supporting-text">投票のルール</p>
                    <p class="text-left primary-text">この投票は{{ resultRule }}で集計されました。</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import firebase from 'firebase';
    import 'firebase/firestore';

    export default {
        unsubscribe: null,

        data: function() {
            return {
                title: "",
                searchingView: true,
                roomOutlineView: false,
                noResultsView: false,
                isClosed: false,
                resultView: false,
                showRankLabel: true,
                room: [],
                docId: "",
                resultTitle: "",
                arrayOfResults: [],
                resultRule: "",
                roomData: undefined,
                personalRanks: [],
                numOfVoters: []
            }
        },

        created: function() {
            const hasVoted = this.$route.query.hasVoted;

            if (hasVoted) {
                this.roomData = this.$route.query.room;
                const docId = this.$route.query.docId;
                this.showResult(this.roomData, docId);
            } else {
                this.showRoomOutline();
            }
        },

        destroyed: function() {
            if (this.unsubscribe) {
                console.log('listener is stopping. ', this.unsubscribe);
                this.unsubscribe();
                this.unsubscribe = null;
            }
        },

        watch: {
            personalRanks: function() {
                this.reloadResult(this.roomData);
            }
        },

        methods: {
            goToVoteButtonClicked: function() {
                this.$router.push({
                    name: 'form',
                    query: {
                        room: this.room,
                        docId: this.docId
                    }
                });
            },

            showRoomOutline: function() {
                const enteredTitle = this.$route.query.enteredTitle;
                this.enteredTitle = enteredTitle;

                const db = firebase.firestore();
                const roomsRef = db.collection("rooms");

                roomsRef.where("title", "==", enteredTitle).get().then((querySnapshot) => {
                    let roomData;
                    querySnapshot.forEach((doc) => {

                        const attendedRooms = this.$route.query.attendedRooms;
                        if (attendedRooms.includes(doc.id)) {
                            this.roomData = doc.data();
                            this.showResult(doc.data(), doc.id);
                            return
                        }

                        roomData = doc.data();
                        this.title = roomData.title;
                        if (roomData.state == "ongoing") {
                            this.searchingView = false;
                            this.roomOutlineView = true;
                        } else if (roomData.state == "closed") {
                            this.searchingView = false;
                            this.isClosed = true;
                        }
                        this.room = roomData;
                        this.docId = doc.id;
                    });

                    if (roomData == undefined) {
                        this.searchingView = false;
                        this.noResultsView = true;
                    }
                });
            },

            showResult: function(roomData, docId) {
                if (this.unsubscribe) {
                    console.warn('listener is running. ', this.unsubscribe);
                    this.unsubscribe();
                    this.unsubscribe = null;
                }

                const db = firebase.firestore();
                const votesRef = db.collection("rooms").doc(docId).collection("votes");

                this.unsubscribe = votesRef.onSnapshot(snapshot => {
                    let ranks = [];
                    let num = 0;
                    snapshot.docChanges().forEach(change => {
                        if (change.type === "added") {
                            ranks.push(change.doc.data().personalRank);
                            num += 1;
                        }
                    });
                    this.personalRanks = this.personalRanks.concat(ranks);
                    this.numOfVoters += num;
                    console.log("personalRanks", this.personalRanks);
                });

                this.reloadResult(roomData);
            },

            reloadResult: function(roomData) {
                if (this.unsubscribe) {
                    this.resultTitle = roomData.title;
                    this.enteredTitle = roomData.title;
                    switch (roomData.rule) {
                        case "majorityRule":
                            this.arrayOfResults = this.majorityRule(this.personalRanks, roomData);
                            break;
                        case "bordaRule":
                            this.arrayOfResults = this.bordaRule(this.personalRanks, roomData);
                            break;
                        case "condorcetRule":
                            this.showRankLabel = false;
                            this.arrayOfResults = this.condorcetRule(this.personalRanks, roomData);
                            break;
                        default:
                            break;
                    }
                    this.resultRule = this.convertRuleNameToDisplayName(roomData.rule);

                    if (roomData.state == "ongoing") {
                        this.searchingView = false;
                        this.resultView = true;
                    } else if (roomData.state == "closed") {
                        this.searchingView = false;
                        this.isClosed = true;
                    }
                    console.log("personalRanks: ", this.personalRanks);
                }
            },

            majorityRule: function(personalRanks, roomData) {
                let results = [];
                for (let i = 0; i < roomData.options.length; i++) {
                    results.push({
                        name: roomData.options[i],
                        score: 0,
                        rank: 0
                    });
                }
                for (let i = 0; i < personalRanks.length; i++) {
                    const personalRank = personalRanks[i];
                    const indexOftop1 = personalRank.findIndex(item => item == 1);
                    results[indexOftop1].score += 1;
                }
                results.sort(function(a, b) {
                    return b.score - a.score;
                });
                for (let i = 0; i < results.length; i++) {
                    results[i].rank = i + 1;
                }
                for (let i = 0; i < results.length; i++) {
                    if (i == results.length - 1) {
                        break;
                    }
                    if (results[i].score == results[i + 1].score) {
                        results[i + 1].rank = results[i].rank
                    }
                }
                let resultsString = [];
                for (let i = 0; i < results.length; i++) {
                    const result = results[i];
                    resultsString.push({
                        name: result.name,
                        score: result.score.toString() + "票",
                        rank: result.rank.toString() + "位"
                    });
                }
                return [resultsString];
            },

            bordaRule: function(personalRanks, roomData) {
                let results = [];
                for (let i = 0; i < roomData.options.length; i++) {
                    results.push({
                        name: roomData.options[i],
                        score: 0,
                        rank: 0
                    });
                }
                for (let i = 0; i < personalRanks.length; i++) {
                    const personalRank = personalRanks[i];
                    for (let j = 0; j < personalRank.length; j++) {
                        const score = personalRank.length - personalRank[j] + 1;
                        results[j].score += score;
                    }
                }
                results.sort(function(a, b) {
                    return b.score - a.score;
                });
                for (let i = 0; i < results.length; i++) {
                    results[i].rank = i + 1;
                }
                for (let i = 0; i < results.length; i++) {
                    if (i == results.length - 1) {
                        break;
                    }
                    if (results[i].score == results[i + 1].score) {
                        results[i + 1].rank = results[i].rank;
                    }
                }
                let resultsString = [];
                for (let i = 0; i < results.length; i++) {
                    const result = results[i];
                    resultsString.push({
                        name: result.name,
                        score: result.score.toString() + "点",
                        rank: result.rank.toString() + "位"
                    });
                }
                return [resultsString];
            },

            condorcetRule(personalRanks, room) {
                let numOfOptions = room.options.length;

                //set results zero
                let results = [];
                for (let i = 0; i < numOfOptions; i++) {
                    results.push({
                        arrayIndex: i,
                        name: room.options[i],
                        score: 0,
                        rank: 0
                    });
                }
                console.log(numOfOptions);

                //set nArray zero
                let nArray = [];
                let nArrayLength = 2 * numOfOptions * (numOfOptions - 1) / 2;
                for (let i = 0; i < nArrayLength; i++) {
                    nArray.push(0);
                }

                //calculate nArray
                for (let f = 0; f < personalRanks.length; f++) {
                    let personalRank = personalRanks[f];

                    for (let i = 0; i < numOfOptions; i++) {
                        for (let g = 0; g < numOfOptions; g++) {
                            let j = g + i + 1;
                            if (j > numOfOptions - 1) {
                                break;
                            }
                            //count votes
                            if (personalRank[i] < personalRank[j]) {
                                let nArrayIndexOfIJ = this.nArrayIndex(i, j, numOfOptions);
                                nArray[nArrayIndexOfIJ] += 1;
                            } else {
                                let nArrayIndexOfJI = this.nArrayIndex(j, i, numOfOptions);
                                nArray[nArrayIndexOfJI] += 1;
                            }
                        }
                    }
                }
                console.log(nArray);

                //calculate pArrayElements
                let pArrayElements = this.pArrayElementsCalculate(numOfOptions);
                console.log(pArrayElements);

                //set pArray zero
                let pArray = [];
                let pArrayLength = this.factorial(numOfOptions);
                for (let i = 0; i < pArrayLength; i++) {
                    pArray.push(0);
                }

                //calculate pArray
                for (let k = 0; k < pArrayLength; k++) {
                    let pElement = pArrayElements[k];
                    let nElements = [];

                    for (let i = 0; i < numOfOptions; i++) {
                        for (let g = 0; g < numOfOptions; g++) {
                            let j = g + i + 1;
                            if (j > numOfOptions - 1) {
                                break;
                            }
                            let nIndex = this.nArrayIndex(pElement[i], pElement[j], numOfOptions);
                            nElements.push(nArray[nIndex]);
                        }
                    }

                    for (let i = 0; i < nElements.length; i++) {
                        pArray[k] += nElements[i];
                    }
                }
                console.log(pArray);

                //    //find the biggests
                let maxIndexes = [0];
                for (let i = 0; i < pArray.length; i++) {
                    if (i === pArray.length - 1) {
                        break;
                    }
                    let maxIndexFirst = maxIndexes[0];
                    if (pArray[maxIndexFirst] < pArray[i + 1]) {
                        maxIndexes = [];
                        maxIndexes.push(i + 1);
                    } else if (pArray[maxIndexFirst] === pArray[i + 1]) {
                        maxIndexes.push(i + 1);
                    }
                }
                let maxPElements = [];
                for (let i = 0; i < maxIndexes.length; i++) {
                    maxPElements.push(pArrayElements[maxIndexes[i]]);
                }
                console.log(maxPElements);

                //refine results
                let arrayOfResults = [];
                for (let k = 0; k < maxPElements.length; k++) {
                    let maxPElement = maxPElements[k];
                    for (let i = 0; i < numOfOptions; i++) {
                        results[i].rank = maxPElement[i] + 1;
                    }
                    //sort
                    results.sort(this.compareRanks);

                    arrayOfResults.push(results);
                }

                return arrayOfResults;
            },

            nArrayIndex: function(i, j, numOfOptions) {
                let index;
                if (i < j) {
                    index = (numOfOptions - 1) * i + j - 1;
                } else {
                    index = (numOfOptions - 1) * i + (j + 1) - 1;
                }
                return index;
            },

            pArrayElementsCalculate: function(numOfOptions) {
                let pArrayElements = [];
                let originalPArrayLength = Math.pow(numOfOptions, numOfOptions)

                for (let i = 0; i < originalPArrayLength; i++) {
                    //set element zero
                    let element = [];
                    for (let j = 0; j < numOfOptions; j++) {
                        element.push(0);
                    }

                    //calculate elements including redundancy
                    let num = Number(i.toString(numOfOptions));
                    for (let j = 0; j < numOfOptions; j++) {
                        element[numOfOptions - 1 - j] = (num % 10);
                        num = Math.floor(num / 10);
                    }

                    //find redundancy
                    let nonRedundantElement = element.filter(function(x, i, self) {
                        return self.indexOf(x) === i;
                    });
                    if (nonRedundantElement.length === numOfOptions) {
                        pArrayElements.push(element);
                    }
                }

                return pArrayElements;
            },


            factorial: function(num) {
                if (num === 0) {
                    return 1;
                }
                return num * this.factorial(num - 1);
            },

            compareRanks: function(a, b) {
                let aRank = a.rank;
                let bRank = b.rank;

                let comparison = 0;
                if (aRank > bRank) {
                    comparison = 1;
                } else if (aRank < bRank) {
                    comparison = -1;
                }
                return comparison;
            },

            convertRuleNameToDisplayName: function(rule) {
                switch (rule) {
                    case "majorityRule":
                        return "多数決";
                    case "bordaRule":
                        return "ボルダルール";
                    case "condorcetRule":
                        return "コンドルセ・ヤングの最尤法";
                    default:
                        return ""
                }
            }
        }
    }

</script>

<style>
    body {
        user-select: none;
    }

    .body-padding {
        padding: 20px;
    }

    #room-outline li {
        list-style: none;
    }

    .content {
        max-width: 400px;
        margin: 0 auto;
    }

    .result-section {
        margin: 5px 0 20px 0;
    }

    .result-small-section {
        margin-bottom: 30px;
    }

    .supporting-text {
        font-size: 10pt;
        color: rgba(0, 0, 0, 0.7);
    }

    .primary-text {
        font-size: 12pt;
    }

    .results-table {
        margin: 5px 0;
        display: flex;
        justify-content: space-between;
    }

    .rank-label {
        width: 50px;
    }

    .optionname-label {
        min-width: 200px;
    }

    .score-label {
        min-width: 60px;
        text-align: right;
    }

    .small-loading-section {
        margin: 0;
    }

    .text-right {
        text-align: right;
    }

    .margin-zero-p {
        margin: 0;
    }

    .inlineblock {
        display: inline-block;
        text-align: right;
        vertical-align: middle;
    }

    .small-loading {
        border: 2px solid #cccccc;
        border-radius: 50%;
        border-top: 2px solid #2D4BF2;
        width: 15px;
        height: 15px;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }

        100% {
            transform: rotate(360deg);
        }
    }

</style>
