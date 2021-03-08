<template>
  <div id="room-outline" class="body-padding">
    <div class="content">
      <div v-if="searchingView" class="result-section">
        <p class="primary-text">検索中...</p>
      </div>

      <div v-if="roomOutlineView" class="result-section">
        <p class="text-left supporting-text">タイトル</p>
        <p class="text-left primary-text">{{ title }}</p>
        <button v-on:click="goToVoteButtonClicked" class="primary-button">
          投票する
        </button>
      </div>

      <div v-if="noResultsView" class="result-section">
        <p class="primary-text">"{{ enteredTitle }}":<br />該当なし</p>
      </div>

      <div v-if="isClosed" class="result-section">
        <p class="primary-text">"{{ enteredTitle }}"は非公開です。</p>
      </div>

      <div v-if="resultView" class="result-section text-right">
        <div class="small-loading-section">
          <div class="small-loading-container inlineblock">
            <div class="small-loading-b"></div>
            <div class="small-loading-f"></div>
          </div>
          <p class="supporting-text inlineblock margin-zero-p">ライブ</p>
        </div>
        <div class="result-small-section">
          <p class="text-left supporting-text">タイトル</p>
          <p class="text-left primary-text">{{ resultTitle }}</p>
        </div>
        <div class="result-small-section">
          <p class="text-left supporting-text">結果</p>
          <ul v-for="(results, index) in arrayOfResults">
            <p
              v-if="arrayOfResults.length > 1"
              class="text-left supporting-text"
            >
              {{ index + 1 }}つ目の可能性
            </p>
            <li
              v-for="result in results"
              class="text-left primary-text results-table"
            >
              <span class="rank-label">{{ result.rank }}</span
              ><span class="optionname-label">{{ result.name }}</span
              ><span v-if="showRankLabel" class="score-label">{{
                result.score
              }}</span>
            </li>
            <p class="text-right supporting-text">
              {{ numOfVoters }}人が投票済み
            </p>
          </ul>
        </div>
        <div class="result-small-section">
          <p class="text-left supporting-text">投票のルール</p>
          <p class="text-left primary-text">
            この投票は{{ resultRule }}で集計されました。
          </p>
        </div>
        <div class="result-small-section">
          <div v-if="roomData.rule !== 'majorityRule'" class="text-left">
            <div v-if="isViewOtherResultsActive">
              <div v-if="otherRulesResults.majorityRule !== undefined">
                <ul v-for="results in otherRulesResults.majorityRule">
                  <p>もし多数決だったら</p>
                  <li
                    v-for="result in results"
                    class="text-left primary-text results-table"
                  >
                    <span class="rank-label">{{ result.rank }}</span
                    ><span class="optionname-label">{{ result.name }}</span
                    ><span v-if="showRankLabel" class="score-label">{{
                      result.score
                    }}</span>
                  </li>
                </ul>
              </div>
              <div v-if="otherRulesResults.bordaRule !== undefined">
                <ul v-for="results in otherRulesResults.bordaRule">
                  <p>もしボルダルールだったら</p>
                  <li
                    v-for="result in results"
                    class="text-left primary-text results-table"
                  >
                    <span class="rank-label">{{ result.rank }}</span
                    ><span class="optionname-label">{{ result.name }}</span
                    ><span v-if="showRankLabel" class="score-label">{{
                      result.score
                    }}</span>
                  </li>
                </ul>
              </div>
              <div v-if="otherRulesResults.condorcetRule !== undefined">
                <ul v-for="(results, index) in otherRulesResults.condorcetRule">
                  <p class="text-left supporting-text">
                    もしコンドルセ・ヤングの最尤法だったら
                    <span v-if="otherRulesResults.condorcetRule.length > 1">
                      ({{ index + 1 }}つ目の可能性)
                    </span>
                  </p>
                  <li
                    v-for="result in results"
                    class="text-left primary-text results-table"
                  >
                    <span class="rank-label">{{ result.rank }}</span>
                    <span class="optionname-label">{{ result.name }}</span>
                  </li>
                </ul>
              </div>
          </div>
          <button v-on:click="toggleViewOtherRules" class="text-button">
            <div v-if="isViewOtherResultsActive">結果の検証を非表示</div>
            <div v-else>結果の検証を表示</div>
          </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import firebase from "firebase";
import "firebase/firestore";

export default {
  unsubscribe: null,

  data: function () {
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
      numOfVoters: [],
      isViewOtherResultsActive: false,
      otherRulesResults: []
    };
  },

  created: function () {
    const hasVoted = this.$route.query.hasVoted;

    if (hasVoted) {
      this.roomData = this.$route.query.room;
      const docId = this.$route.query.docId;
      this.showResult(this.roomData, docId);
    } else {
      this.showRoomOutline();
    }
  },

  destroyed: function () {
    if (this.unsubscribe) {
      console.log("listener is stopping. ", this.unsubscribe);
      this.unsubscribe();
      this.unsubscribe = null;
    }
  },

  watch: {
    personalRanks: function () {
      this.reloadResult(this.roomData);
    },
  },

  methods: {
    goToVoteButtonClicked: function () {
      this.$router.push({
        name: "form",
        query: {
          room: this.room,
          docId: this.docId,
        },
      });
    },

    showRoomOutline: async function () {
      const enteredTitle = this.$route.query.enteredTitle;
      this.enteredTitle = enteredTitle;

      const db = firebase.firestore();
      const roomsRef = db.collection("rooms");

      roomsRef
        .where("title", "==", enteredTitle)
        .get()
        .then((querySnapshot) => {
          let roomData;
          console.log("querySnapshot: ", querySnapshot);
          querySnapshot.forEach((doc) => {
            const attendedRooms = this.$route.query.attendedRooms;
            if (attendedRooms.includes(doc.id)) {
              this.roomData = doc.data();
              this.showResult(doc.data(), doc.id);
              return;
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

          if (querySnapshot.docs.length <= 0) {
            this.searchingView = false;
            this.noResultsView = true;
          }
        });
    },

    showResult: function (roomData, docId) {
      if (this.unsubscribe) {
        console.warn("listener is running. ", this.unsubscribe);
        this.unsubscribe();
        this.unsubscribe = null;
      }

      const db = firebase.firestore();
      const votesRef = db.collection("rooms").doc(docId).collection("votes");

      this.unsubscribe = votesRef.onSnapshot((snapshot) => {
        let ranks = [];
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            ranks.push(change.doc.data().personalRank);
          }
        });
        this.personalRanks = this.personalRanks.concat(ranks);
        this.numOfVoters = snapshot.docs.length;
        console.log("personalRanks", this.personalRanks);
      });

      this.reloadResult(roomData);
    },

    reloadResult: function (roomData) {
      if (this.unsubscribe) {
        this.resultTitle = roomData.title;
        this.enteredTitle = roomData.title;
        switch (roomData.rule) {
          case "majorityRule":
            this.arrayOfResults = this.majorityRule(
              this.personalRanks,
              roomData
            );
            break;
          case "bordaRule":
            this.arrayOfResults = this.bordaRule(this.personalRanks, roomData);
            this.otherRulesResults = {majorityRule: [], condorcetRule: []};
            this.otherRulesResults.majorityRule = this.majorityRule(
              this.personalRanks,
              roomData
            );
            const condorcetResultAsOtherRule = this.condorcetRule(
              this.personalRanks,
              roomData
            );
            this.otherRulesResults.condorcetRule = this.removeDuplication(condorcetResultAsOtherRule);
            console.log("otherRulesResults", this.otherRulesResults);
            break;
          case "condorcetRule":
            this.showRankLabel = false;
            const condorcetResult = this.condorcetRule(
              this.personalRanks,
              roomData
            );
            this.arrayOfResults = this.removeDuplication(condorcetResult);
            this.otherRulesResults = {majorityRule: [], bordaRule: []};
            this.otherRulesResults.majorityRule = this.majorityRule(
              this.personalRanks,
              roomData
            );
            this.otherRulesResults.bordaRule = this.bordaRule(
              this.personalRanks,
              roomData
            );
            console.log("otherRulesResults", this.otherRulesResults)
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

    removeDuplication: function (arrayOfResults) {
      //jsではsliceされた要素は参照が異なるので、異なる値としてみられる
      // mapを使ってarrayIndexのみの配列を作ってそれを比較すれば参照にならない。
      const optionNames = arrayOfResults.map(function(results) {
        let optionsName = ""
        for (let i = 0; i < results.length; i++) {
          const result = results[i]
          optionsName += result.name + result.arrayIndex
        }
        return optionsName;
      });
      console.log("optionNames: ", optionNames);

      const newArray = [arrayOfResults[0]];
      for (let i = 0; i < arrayOfResults.length; i++) {
        for (let j = 0; j < i; j++) {
          if (i === 0) { break; }
          const resultsI = optionNames[i];
          const resultsJ = optionNames[j];
          if (resultsI === resultsJ) { break; }
          if (j === i - 1) {
            newArray.push(arrayOfResults[i]);
          }
        }
      }
      return newArray;
    },

    toggleViewOtherRules: function () {
      if (this.isViewOtherResultsActive) {
        this.isViewOtherResultsActive = false;
      } else {
        this.isViewOtherResultsActive = true;
      }
    },

    majorityRule: function (personalRanks, roomData) {
      let results = [];
      for (let i = 0; i < roomData.options.length; i++) {
        results.push({
          name: roomData.options[i],
          score: 0,
          rank: 0,
        });
      }
      for (let i = 0; i < personalRanks.length; i++) {
        const personalRank = personalRanks[i];
        const indexOftop1 = personalRank.findIndex((item) => item == 1);
        results[indexOftop1].score += 1;
      }
      results.sort(function (a, b) {
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
          score: result.score.toString() + "票",
          rank: result.rank.toString() + "位",
        });
      }
      return [resultsString];
    },

    bordaRule: function (personalRanks, roomData) {
      let results = [];
      for (let i = 0; i < roomData.options.length; i++) {
        results.push({
          name: roomData.options[i],
          score: 0,
          rank: 0,
        });
      }
      for (let i = 0; i < personalRanks.length; i++) {
        const personalRank = personalRanks[i];
        for (let j = 0; j < personalRank.length; j++) {
          const score = personalRank.length - personalRank[j] + 1;
          results[j].score += score;
        }
      }
      results.sort(function (a, b) {
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
          rank: result.rank.toString() + "位",
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
          rank: 0,
        });
      }
      console.log(numOfOptions);

      //set nArray zero
      let nArray = [];
      let nArrayLength = (2 * numOfOptions * (numOfOptions - 1)) / 2;
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
      console.log("nArray", nArray);

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
            let nIndex = this.nArrayIndex(
              pElement[i],
              pElement[j],
              numOfOptions
            );
            nElements.push(nArray[nIndex]);
          }
        }

        for (let i = 0; i < nElements.length; i++) {
          pArray[k] += nElements[i];
        }
      }
      console.log("pArray", pArray);

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
      const maxPElements = [];
      for (let i = 0; i < maxIndexes.length; i++) {
        maxPElements.push(pArrayElements[maxIndexes[i]]);
      }
      console.log("maxPElements", maxPElements);

      //refine results
      const arrayOfResults = [];
      for (let k = 0; k < maxPElements.length; k++) {
        let maxPElement = maxPElements[k];
        for (let i = 0; i < numOfOptions; i++) {
          results[i].rank = maxPElement[i] + 1;
        }
        console.log("results", results);
        //sort
        results.sort(function(a, b) {
          return a.rank - b.rank;
        });
        console.log("results", results);
        //jsは参照なので、sliceしないと最後のsort結果が全部反映されてしまう。
        arrayOfResults.push(results.slice());
      }
      console.log("arrayOfResults: ", arrayOfResults);

      return arrayOfResults;
    },

    nArrayIndex: function (i, j, numOfOptions) {
      let index;
      if (i < j) {
        index = (numOfOptions - 1) * i + j - 1;
      } else {
        index = (numOfOptions - 1) * i + (j + 1) - 1;
      }
      return index;
    },

    pArrayElementsCalculate: function (numOfOptions) {
      let pArrayElements = [];
      let originalPArrayLength = Math.pow(numOfOptions, numOfOptions);

      for (let i = 0; i < originalPArrayLength; i++) {
        //set element zero
        let element = [];
        for (let j = 0; j < numOfOptions; j++) {
          element.push(0);
        }

        //calculate elements including redundancy
        let num = Number(i.toString(numOfOptions));
        for (let j = 0; j < numOfOptions; j++) {
          element[numOfOptions - 1 - j] = num % 10;
          num = Math.floor(num / 10);
        }

        //find redundancy
        let nonRedundantElement = element.filter(function (x, i, self) {
          return self.indexOf(x) === i;
        });
        if (nonRedundantElement.length === numOfOptions) {
          pArrayElements.push(element);
        }
      }

      return pArrayElements;
    },

    factorial: function (num) {
      if (num === 0) {
        return 1;
      }
      return num * this.factorial(num - 1);
    },

    compareRanks: function (a, b) {
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

    convertRuleNameToDisplayName: function (rule) {
      switch (rule) {
        case "majorityRule":
          return "多数決";
        case "bordaRule":
          return "ボルダルール";
        case "condorcetRule":
          return "コンドルセ・ヤングの最尤法";
        default:
          return "";
      }
    },
  },
};
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
  color: #4c4c4c;
}

.primary-text {
  font-size: 12pt;
  color: #000000;
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

.small-loading-container {
  position: relative;
  width: 16px;
  height: 16px;
  margin: 0;
}

.small-loading-b {
  background: -webkit-radial-gradient(
    rgba(45, 75, 242, 0.5),
    rgba(45, 75, 242, 0)
  );
  background: radial-gradient(rgba(45, 75, 242, 0.5), rgba(45, 75, 242, 0));
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 0;
  top: 0;
  left: 0;
  margin: 0;
  border-radius: 50%;
  animation: live-animation 3s ease infinite;
}

.small-loading-f {
  background: #2d4bf2;
  width: 50%;
  height: 50%;
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  margin: 25%;
  border-radius: 50%;
}

@keyframes live-animation {
  0% {
    width: 50%;
    height: 50%;
    margin: 25%;
  }
  50% {
    width: 50%;
    height: 50%;
    margin: 25%;
  }
  100% {
    width: 100%;
    height: 100%;
    margin: 0;
  }
}

.text-button {
    text-align: center;
    color: #2D4BF2;
    border: none;
    background: 0;
    padding: 5px 15px;
    border-radius: 5px;
    vertical-align: middle;
    font-size: 11pt;
}

.text-button:hover {
    background: rgba(0, 0, 0, 0.05);
}
</style>
