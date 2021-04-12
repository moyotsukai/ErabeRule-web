<template>
    <div id="newroom-app" class="body-padding">
        <div class="content">
            <div v-if="!hasPosted" class="result-section">
                <div class="result-small-section">
                    <p class="text-left supporting-text">タイトル</p>
                    <input type="text" v-model="enteredTitle" placeholder="タイトルを入力" class="primary-textfield newroom-textfield">
                    <p v-if="shouldChangeTitle" class="text-left supporting-text error-color">すでに使われているタイトルです。末尾に数字をつけるなどしてみてください。</p>
                </div>

                <div class="result-small-section">
                    <p class="text-left supporting-text">説明</p>
                    <div class="text-left">
                        <button v-on:click="addExplanation" v-if="!hasAddedExplanation" class="text-button">説明文を追加</button>
                    </div>
                    <textarea ref="adjust_textarea" type="text" v-model="enteredExplanation" @keydown="adjustHeight" placeholder="説明文を入力" v-if="hasAddedExplanation" class="primary-textfield newroom-textfield"></textarea>
                </div>

                <div class="result-small-section">
                    <p class="text-left supporting-text">選択肢</p>
                    <ul>
                        <li v-for="option in enteredOptions">
                            <input type="text" v-model="option.text" placeholder="選択肢を入力" class="primary-textfield newroom-textfield">
                        </li>
                        <div class="text-left">
                            <button v-on:click="addOption" class="text-button">選択肢を追加</button>
                        </div>
                    </ul>
                </div>

                <div class="result-small-section">
                    <p class="text-left supporting-text">投票のルールを選択</p>
                    <ul>
                        <li v-for="rule in rulesArray" class="selectrule-table">
                            <input type="radio" v-bind:id="rule.name" v-on:click="radioChecked(rule)">
                            <label v-bind:for="rule.name" class="primary-radio">{{ rule.displayName }}</label>
                            <p v-if="rule.checked" class="rule-explanation">{{ rule.explanation }}</p>
                        </li>
                    </ul>
                </div>

                <div v-if="selectedRule == 'majorityJudgement'" class="result-small-section">
                    <p class="text-left supporting-text">評価の語彙(良い方から順に入力)</p>
                    <ul>
                        <li v-for="language in commonLanguage" class="selectrule-table">
                          <div class="common-language">
                            <input type="text" v-model="language.text" placeholder="評価の語彙を入力" class="primary-textfield newroom-textfield">
                            <button v-on:click="deleteLanguage(language.text)" class="delete-button"></button>
                          </div>
                        </li>
                        <div class="text-left">
                            <button v-on:click="addLanguage" class="text-button">評価の語彙を追加</button>
                        </div>
                    </ul>
                </div>

                <div class="result-small-section">
                    <p class="text-left supporting-text">参加者は投票ルームのタイトルを入力することで検索できます。</p>
                </div>

                <div class="result-small-section">
                    <button v-on:click="sendButtonClicled" v-bind:disabled="!isFormFilled" class="primary-button">公開</button>
                </div>
            </div>
            <div v-if="hasPosted" class="result-section">
                <p class="text-left primary-text">公開済み</p>
            </div>
        </div>
    </div>
</template>

<script>
    import firebase from 'firebase';
    import 'firebase/firestore';

    export default {
        data: function() {
            return {
                enteredTitle: this.enteredTitle,
                shouldChangeTitle: false,
                enteredExplanation: this.enteredExplanation,
                enteredOptions: [{
                    text: ""
                }],
                selectedRule: "",
                hasAddedExplanation: false,
                isFormFilled: false,
                hasPosted: false,

                rulesArray: [{
                    index: 0,
                    name: "majorityRule",
                    displayName: "多数決",
                    explanation: "通常の多数決です。",
                    checked: false
                }, {
                    index: 1,
                    name: "bordaRule",
                    displayName: "ボルダルール",
                    explanation: "選択肢が３つ以上の時に使えます。例えば３択の時、１番良いと思う候補に３点、２番目に２点、３番目に１点を加算します。勝者は満場一致に最も近いものになります。",
                    checked: false
                }, {
                    index: 2,
                    name: "condorcetRule",
                    displayName: "コンドルセ・ヤングの最尤法",
                    explanation: "選択肢が３つ以上の時に使えます。総当たり戦を元に確率の計算を行います。勝者は他の候補との一騎打ちで必ず勝利します。",
                    checked: false
                }, {
                  index: 3,
                  name: "majorityJudgement",
                  displayName: "マジョリティ・ジャッジメント",
                  explanation: "各選択肢に対して絶対評価で投票し、中央値をその候補の評価とします。",
                  checked: false
                }],

                commonLanguage: [
                  {text: "非常に良い"},
                  {text: "良い"},
                  {text: "まずまず"},
                  {text: "容認"},
                  {text: "不十分"},
                  {text: "失格"}
                ]
            }
        },

        watch: {
            enteredTitle: function() {
                this.isFormFilled = this.checkIfFormIsFilled();
            },
            enteredOptions: {
                handler: function() {
                  this.isFormFilled = this.checkIfFormIsFilled();
                  console.log("enteredOptions: ", this.enteredOptions);
                },
                deep: true
            },
            selectedRule: function() {
                this.isFormFilled = this.checkIfFormIsFilled();
            },
            commonLanguage: {
                handler: function() {
                  this.isFormFilled = this.checkIfFormIsFilled();
                  console.log("commonLanguage: ", this.commonLanguage);
                },
                deep: true
            }
        },

        methods: {
            addExplanation: function() {
                this.hasAddedExplanation = true;
            },

            addOption: function() {
                this.enteredOptions = this.removeBlanks(this.enteredOptions);
                this.enteredOptions.push({
                    text: ""
                });
            },

            addLanguage: function() {
                this.commonLanguage = this.removeBlanks(this.commonLanguage);
                this.commonLanguage.push({
                  text: ""
                })
            },

            removeBlanks: function(array) {
                let resultArray = [];
                for (let i = 0; i < array.length; i++) {
                    if (array[i].text != "") {
                        resultArray.push(array[i]);
                    }
                }
                return resultArray;
            },

            radioChecked: function(rule) {
                if (!rule.checked) {
                    let checkedRule;
                    for (let i = 0; i < this.rulesArray.length; i++) {
                        if (this.rulesArray[i].checked == true) {
                            checkedRule = this.rulesArray[i];
                            break;
                        }
                    }
                    if (checkedRule != undefined) {
                        document.getElementById(checkedRule.name).checked = false;
                        document.getElementById(rule.name).checked = true;
                        this.rulesArray[checkedRule.index].checked = false;
                        this.rulesArray[rule.index].checked = true;
                    } else {
                        document.getElementById(rule.name).checked = true;
                        this.rulesArray[rule.index].checked = true;
                    }
                } else {
                    document.getElementById(rule.name).checked = false;
                    this.rulesArray[rule.index].checked = false;
                }

                this.selectedRule = this.findSelectedRule();
                console.log("selectedRuleL ", this.selectedRule);
            },

            findSelectedRule: function() {
                let rule;
                for (let i = 0; i < this.rulesArray.length; i++) {
                    if (this.rulesArray[i].checked == true) {
                        rule = this.rulesArray[i].name;
                        break;
                    }
                }
                return rule;
            },

            deleteLanguage: function(text) {
                const index = this.commonLanguage.findIndex(function(value, index, array) {
                  if (value.text == text) {
                    return true;
                  } else {
                    return false;
                  }
                });
                this.commonLanguage.splice(index, 1);
            },

            checkIfFormIsFilled: function() {
                let isFilled = true;
                if (this.enteredTitle == undefined || this.enteredTitle == "") {
                    isFilled = false;
                }
                if (this.removeBlanks(this.enteredOptions).length == 0) {
                    isFilled = false;
                }
                if (this.selectedRule == "" || this.selectedRule == undefined) {
                    isFilled = false;
                }
                if (this.removeBlanks(this.commonLanguage).length == 0) {
                    isFilled = false;
                }
                return isFilled;
            },

            sendButtonClicled: function() {
                console.log("enteredTitle: ", this.enteredTitle);
                console.log("enteredExplanation: ", this.enteredExplanation);
                console.log("selectedRule: ", this.selectedRule);

                const options = this.generateOptionsArray();
                const commonLanguage = this.generateCommonLanguage();
                let explanation = "";
                if (this.enteredExplanation == undefined) {
                    explanation = "";
                } else {
                    explanation = this.enteredExplanation;
                }
                console.log("explanation: ", explanation);
                this.send(options, explanation, commonLanguage);
            },

            generateOptionsArray: function() {
                let options = [];
                for (let i = 0; i < this.enteredOptions.length; i++) {
                    const option = this.enteredOptions[i].text;
                    if (option != "") {
                      options.push(option);
                    }
                }
                return options;
            },

            generateCommonLanguage: function() {
                let commonLanguage = [];
                for (let i = 0; i < this.commonLanguage.length; i++) {
                  const language = this.commonLanguage[i].text;
                  if (language != "") {
                    commonLanguage.push(language);
                  }
                }
                return commonLanguage;
            },

            send: function(options, explanation, commonLanguage) {
                const title = this.enteredTitle;
                const db = firebase.firestore();
                const roomsRef = db.collection("rooms");
                roomsRef.where("title", "==", title).get().then((querySnapshot) => {
                    let roomData;
                    querySnapshot.forEach((doc) => {
                        roomData = doc.data();
                    });
                    if (roomData != undefined) {
                        this.shouldChangeTitle = true;

                    } else {
                        this.shouldChangeTitle = false;

                        //send
                        const roomRef = db.collection("rooms").doc();
                        const newRoomId = roomRef.id;
                        console.log("newRoomId: ", newRoomId);
                        const userId = firebase.auth().currentUser.uid;
                        console.log("userId: ", userId);
                        let dataObject;
                        if (this.selectedRule == "majorityJudgement") {
                          dataObject = {
                              title: this.enteredTitle,
                              explanation: explanation,
                              options: options,
                              commonLanguage: commonLanguage,
                              rule: this.selectedRule,
                              state: "ongoing",
                              senderId: userId,
                              date: new Date()
                          }
                        } else {
                          dataObject = {
                              title: this.enteredTitle,
                              explanation: explanation,
                              options: options,
                              rule: this.selectedRule,
                              state: "ongoing",
                              senderId: userId,
                              date: new Date()
                          }
                        }
                        console.log("dataObject: ", dataObject);

                        roomRef.set(
                          dataObject
                        ).then(function() {

                            //getUserAttendance
                            const userRef = db.collection("users").doc(userId);
                            userRef.get().then(function(doc) {
                                let createdRooms = [];
                                if (doc.exists) {
                                    const userData = doc.data();
                                    if (userData.createdRooms != []) {
                                        //Returning user
                                        createdRooms = userData.createdRooms;
                                        createdRooms.unshift(newRoomId);
                                        //updateUserAttendance
                                        userRef.update({
                                            createdRooms: createdRooms,
                                            date: new Date()
                                        }).then(function() {
                                            console.log("Successfully updated data");
                                            //dismiss
                                        }).catch(function(error) {
                                            console.error("Error writing document: ", error);
                                        });
                                        console.log("returning");

                                    } else {
                                        //New user
                                        createdRooms = [newRoomId];
                                        //addUserAttendance
                                        userRef.set({
                                            attendedRooms: [],
                                            createdRooms: createdRooms,
                                            date: new Date()
                                        }).then(function() {
                                            console.log("Successfully set data");
                                            //dismiss
                                        }).catch(function(error) {
                                            console.error("Error writing document: ", error);
                                        });
                                        console.log("new");

                                    }
                                } else {
                                    //Unknown user
                                    createdRooms = [newRoomId];
                                    //addUserAttendance
                                    userRef.set({
                                        attendedRooms: [],
                                        createdRooms: createdRooms,
                                        date: new Date()
                                    }).then(function() {
                                        console.log("Successfully set data");
                                        //dismiss
                                    }).catch(function(error) {
                                        console.error("Error writing document: ", error);
                                    });
                                    console.log("unknown");

                                }
                            }).catch(function(error) {
                                console.error("Error getting document: ", error);
                            });
                        }).catch(function(error) {
                            console.error("Error writing document: ", error);
                        });
                        this.hasPosted = true;
                    }

                });

            },

            adjustHeight: function() {
              const textarea = this.$refs.adjust_textarea
              const resetHeight = new Promise(function(resolve) {
                resolve(textarea.style.height = 'auto')
              });
              resetHeight.then(function(){
                textarea.style.height = textarea.scrollHeight + 'px'
              });
            }
        }
    }

</script>

<style>
  @import "../assets/css/style.css";

  #newroom-app li {
      list-style: none;
  }
</style>
