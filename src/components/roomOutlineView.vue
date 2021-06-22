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
          <ul v-for="(results, index, key) in arrayOfResults" :key="key">
            <p
              v-if="arrayOfResults.length > 1"
              class="text-left supporting-text"
            >
              {{ index + 1 }}つ目の可能性
            </p>

            <div v-if="roomData.rule !== 'majorityJudgement'">
              <li
                v-for="(result, key) in results"
                class="text-left primary-text results-table"
                :key="key"
              >
                <span class="rank-label">{{ result.rank }}</span>
                <span class="optionname-label">{{ result.name }}</span>
                <span v-if="showScoreLabel" class="score-label">
                  {{ result.score }}
                </span>
                <span v-else></span>
              </li>
            </div>
            <div v-else>
              <li
                v-for="(result, key) in results"
                class="text-left primary-text results-table"
                :key="key"
              >
                <span class="rank-label">{{ result.rank }}</span>
                <span>
                  <span class="optionname-label">{{ result.name }}</span>
                  <p class="optionname-label">
                    {{ roomData.commonLanguage[result.score - 1] }}
                  </p>
                </span>
                <span></span>
              </li>
            </div>

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
                <ul
                  v-for="(results, key) in otherRulesResults.majorityRule"
                  :key="key"
                >
                  <p>もし多数決だったら</p>
                  <li
                    v-for="(result, key) in results"
                    class="text-left primary-text results-table"
                    :key="key"
                  >
                    <span class="rank-label">{{ result.rank }}</span>
                    <span class="optionname-label">{{ result.name }}</span>
                    <span class="score-label">{{ result.score }}</span>
                  </li>
                </ul>
              </div>
              <div v-if="otherRulesResults.bordaRule !== undefined">
                <ul
                  v-for="(results, key) in otherRulesResults.bordaRule"
                  :key="key"
                >
                  <p>もしボルダルールだったら</p>
                  <li
                    v-for="(result, key) in results"
                    class="text-left primary-text results-table"
                    :key="key"
                  >
                    <span class="rank-label">{{ result.rank }}</span>
                    <span class="optionname-label">{{ result.name }}</span>
                    <span class="score-label">{{ result.score }}</span>
                  </li>
                </ul>
              </div>
              <div v-if="otherRulesResults.condorcetRule !== undefined">
                <ul
                  v-for="(
                    results, index, key
                  ) in otherRulesResults.condorcetRule"
                  :key="key"
                >
                  <p class="text-left supporting-text">
                    もしコンドルセ・ヤングの最尤法だったら
                    <span v-if="otherRulesResults.condorcetRule.length > 1">
                      ({{ index + 1 }}つ目の可能性)
                    </span>
                  </p>
                  <li
                    v-for="(result, key) in results"
                    class="text-left primary-text results-table"
                    :key="key"
                  >
                    <span class="rank-label">{{ result.rank }}</span>
                    <span class="optionname-label">{{ result.name }}</span>
                    <span class="score-label"></span>
                  </li>
                </ul>
              </div>
              <div v-if="otherRulesResults.averageScore !== undefined">
                <ul
                  v-for="(results, key) in otherRulesResults.averageScore"
                  :key="key"
                >
                  <p>もし平均を使っていたら</p>
                  <li
                    v-for="(result, key) in results"
                    class="text-left primary-text results-table"
                    :key="key"
                  >
                    <span class="rank-label">{{ result.rank }}</span>
                    <span>
                      <span class="optionname-label">{{ result.name }}</span>
                      <p class="optionname-label">
                        {{ result.score }}
                      </p>
                    </span>
                    <span></span>
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
      showScoreLabel: true,
      room: [],
      docId: "",
      resultTitle: "",
      arrayOfResults: [],
      resultRule: "",
      roomData: undefined,
      personalRanks: [],
      numOfVoters: [],
      isViewOtherResultsActive: false,
      otherRulesResults: {},
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
            this.otherRulesResults = { majorityRule: [], condorcetRule: [] };
            this.otherRulesResults.majorityRule = this.majorityRule(
              this.personalRanks,
              roomData
            );
            const condorcetResultAsOtherRule = this.condorcetRule(
              this.personalRanks,
              roomData
            );
            this.otherRulesResults.condorcetRule = this.removeDuplication(
              condorcetResultAsOtherRule
            );
            console.log("otherRulesResults", this.otherRulesResults);
            break;

          case "condorcetRule":
            this.showScoreLabel = false;
            const condorcetResult = this.condorcetRule(
              this.personalRanks,
              roomData
            );
            this.arrayOfResults = this.removeDuplication(condorcetResult);
            this.otherRulesResults = { majorityRule: [], bordaRule: [] };
            this.otherRulesResults.majorityRule = this.majorityRule(
              this.personalRanks,
              roomData
            );
            this.otherRulesResults.bordaRule = this.bordaRule(
              this.personalRanks,
              roomData
            );
            console.log("otherRulesResults", this.otherRulesResults);
            break;

          case "majorityJudgement":
            this.arrayOfResults = this.majorityJudgement(
              this.personalRanks,
              roomData
            );
            this.otherRulesResults = { averageScore: [] };
            this.otherRulesResults.averageScore = this.averageScore(
              this.personalRanks,
              roomData
            );
            console.log("otherRulesResults", this.otherRulesResults);
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
      const optionNames = arrayOfResults.map(function (results) {
        let optionsName = "";
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          optionsName += result.name + result.arrayIndex;
        }
        return optionsName;
      });
      console.log("optionNames: ", optionNames);

      const newArray = [arrayOfResults[0]];
      for (let i = 0; i < arrayOfResults.length; i++) {
        for (let j = 0; j < i; j++) {
          if (i === 0) {
            break;
          }
          const resultsI = optionNames[i];
          const resultsJ = optionNames[j];
          if (resultsI === resultsJ) {
            break;
          }
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
        results.sort(function (a, b) {
          return a.rank - b.rank;
        });
        console.log("results", results);
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          result.rank += "位";
        }
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

    majorityJudgement: function (personalRanks, roomData) {
      let results = [];
      for (let i = 0; i < roomData.options.length; i++) {
        results.push({
          name: roomData.options[i],
          score: 0,
          rank: 0,
        });
      }

      let tieBreakingEvaluations = [];
      for (let i = 0; i < roomData.options.length; i++) {
        let evaluations = personalRanks.map(function (personalRank) {
          return personalRank[i];
        });
        evaluations.sort(function (a, b) {
          return a - b;
        });
        let medianEvaluation;
        if (evaluations.length % 2 == 1) {
          medianEvaluation = evaluations[Math.floor(evaluations.length / 2)];
        } else {
          const lowerMedian = evaluations[Math.floor(evaluations.length / 2)];
          medianEvaluation = lowerMedian;
        }
        results[i].score = medianEvaluation;
        console.log("medianEvaluation", medianEvaluation);
        const atLeastMedianEvaluations = evaluations.filter(function (
          evaluation
        ) {
          return evaluation <= medianEvaluation;
        });
        tieBreakingEvaluations.push(atLeastMedianEvaluations.length);
      }
      console.log("tieBreakingEvaluations: ", tieBreakingEvaluations);
      console.log("results: ", results);

      //Tie Break
      for (let j = 0; j < results.length; j++) {
        if (j === 0) {
          continue;
        }
        for (let i = 0; i < j; i++) {
          if (results[i].score > results[j].score) {
            results = this.swapAt(results, i, j);
          } else if (results[i].score === results[j].score) {
            if (tieBreakingEvaluations[i] < tieBreakingEvaluations[j]) {
              results = this.swapAt(results, i, j);
            } else if (
              tieBreakingEvaluations[i] === tieBreakingEvaluations[j]
            ) {
              results[i].rank = -results[i].score;
              results[j].rank = -results[i].score;
            }
          }
        }
      }

      let finalResults = [];
      for (let i = 0; i < results.length; i++) {
        console.log("results[i].score", results[i].score);
        finalResults.push({
          name: results[i].name,
          score: results[i].score,
          rank: 0,
        });
      }

      for (let i = 0; i < results.length; i++) {
        if (i === 0) {
          finalResults[i].rank = 1;
          continue;
        }
        if (
          results[i].rank === -results[i].score &&
          results[i - 1].rank == -results[i].score
        ) {
          finalResults[i].rank = finalResults[i - 1].rank;
        } else {
          finalResults[i].rank = finalResults[i - 1].rank + 1;
        }
      }

      let finalResultsString = [];
      for (let i = 0; i < results.length; i++) {
        console.log("results[i].score", results[i].score);
        finalResultsString.push({
          name: finalResults[i].name,
          score: finalResults[i].score,
          rank: finalResults[i].rank.toString() + "位",
        });
      }
      console.log("majorityJudgement: ", finalResultsString);
      return [finalResultsString];
    },

    swapAt: function (array, i, j) {
      elementI = array[i];
      elementJ = array[j];
      array[i] = elementJ;
      array[j] = elementI;
      return array;
    },

    averageScore: function (personalRanks, roomData) {
      let results = [];
      for (let i = 0; i < roomData.options.length; i++) {
        results.push({
          name: roomData.options[i],
          score: 0,
          rank: 0,
        });
      }
      const maxScore = roomData.commonLanguage.length;
      console.log("maxScore: " + maxScore);

      for (let i = 0; i < personalRanks.length; i++) {
        const personalRank = personalRanks[i];
        for (let j = 0; j < personalRank.length; j++) {
          const score = maxScore - (personalRank[j] - 1);
          results[j].score += score;
        }
      }
      for (let i = 0; i < results.length; i++) {
        const average = results[i].score / personalRanks.length;
        const roundedAverage = Math.round(average * 10) / 10;
        results[i].score = roundedAverage;
      }
      console.log("average: ", results);
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
          score: result.score.toString() + "/" + maxScore,
          rank: result.rank.toString() + "位",
        });
      }
      return [resultsString];
    },

    convertRuleNameToDisplayName: function (rule) {
      switch (rule) {
        case "majorityRule":
          return "多数決";
        case "bordaRule":
          return "ボルダルール";
        case "condorcetRule":
          return "コンドルセ・ヤングの最尤法";
        case "majorityJudgement":
          return "マジョリティ・ジャッジメント";
        default:
          return "";
      }
    },
  },
};
</script>

<style>
@import "../assets/css/style.css";

#room-outline li {
  list-style: none;
}
</style>
