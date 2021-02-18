<template>
    <div id="form" class="body-padding">
        <div class="content">
            <div class="result-section">
                <div class="result-small-section">
                    <p class="text-left supporting-text">タイトル</p>
                    <p class="text-left primary-text">{{ title }}</p>
                </div>

                <div v-if="showForm">
                    <div class="result-small-section">

                        <p v-if="hasExplanation" class="text-left supporting-text">説明</p>
                        <p v-if="hasExplanation" class="text-left primary-text">{{ explanation }}</p>
                    </div>

                    <div class="result-small-section">
                        <p class="text-left supporting-text">選択肢（支持する順に選んで順位をつけます。）</p>
                        <ul>
                            <li v-for="option in options" class="text-left primary-text results-table">
                                <input type="checkbox" v-bind:id="option.name + option.index" v-model="option.checked" @change="changed(option)" v-if="isCheckBoxStyle">
                                <input type="radio" v-bind:id="option.name + option.index" v-model="option.checked" v-on:click="radioChecked(option)" v-if="!isCheckBoxStyle">
                                <label v-bind:for="option.name + option.index" class="optionname-label" v-bind:class="isCheckBoxStyle? 'primary-checkbox' : 'primary-radio'">{{ option.name }}</label>
                                <label v-bind:for="option.name + option.index" v-if="showRankLabel && option.personalRank != 0" class="personalrank-label">{{ option.personalRank }}</label>
                            </li>
                        </ul>
                    </div>

                    <div class="result-small-section">
                        <p class="text-left supporting-text">この投票は{{ rule }}で集計されます。</p>
                    </div>

                    <div class="result-small-section">
                        <button v-bind:disabled="!isFormFilled" v-on:click="send" class="primary-button">送信</button>
                    </div>
                </div>
            </div>

            <div class="result-section">
                <div v-if="showResultView">
                    <p class="text-left">投票済み</p>
                    <button v-on:click="goToResult" class="primary-button">結果を見る</button>
                </div>
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
                roomData: [],
                docId: "",
                title: "",
                hasExplanation: false,
                explanation: "",
                options: [],
                isCheckBoxStyle: true,
                showRankLabel: true,
                rule: "",
                personalRank: [],
                isFormFilled: false,
                showForm: true,
                showResultView: false
            }
        },

        created: function() {
            this.roomData = this.$route.query.room;
            this.docId = this.$route.query.docId;

            this.title = this.roomData.title;

            if (this.roomData.explanation != "") {
                this.explanation = this.roomData.explanation;
                this.hasExplanation = true;
            }

            for (let i = 0; i < this.roomData.options.length; i++) {
                this.options.push({
                    name: this.roomData.options[i],
                    index: i,
                    checked: false,
                    personalRank: 0
                });
                this.personalRank.push(0);
            }

            if (this.roomData.rule == "majorityRule") {
                this.isCheckBoxStyle = false;
                this.showRankLabel = false;
            }

            this.rule = this.convertRuleNameToDisplayName(this.roomData.rule);
        },

        methods: {
            changed: function(option) {
                this.makeMultiSelection(option);
            },

            radioChecked: function(option) {
                this.makeSingleSelection(option);
            },

            makeSingleSelection: function(option) {
                if (this.personalRank[option.index] == 0) {
                    let selectedOption;
                    console.log("options", this.options);
                    for (let i = 0; i < this.options.length; i++) {
                        if (this.options[i].personalRank == 1) {
                            selectedOption = this.options[i];
                            break;
                        }
                    }
                    console.log("selectedOption", selectedOption);

                    if (selectedOption != undefined) {
                        document.getElementById(selectedOption.name + selectedOption.index).checked = false;
                        document.getElementById(option.name + option.index).checked = true;
                        this.personalRank[selectedOption.index] = 0;
                        this.personalRank[option.index] = 1;
                        this.options[selectedOption.index].personalRank = 0;
                        this.options[option.index].personalRank = 1;
                    } else {
                        document.getElementById(option.name + option.index).checked = true;
                        this.personalRank[option.index] = 1;
                        this.options[option.index].personalRank = 1;
                    }
                } else {
                    document.getElementById(option.name + option.index).checked = false;
                    this.personalRank[option.index] = 0;
                    this.options[option.index].personalRank = 0;
                }
                console.log(this.personalRank);

                let rankWithValue = this.personalRank.filter(item => item != 0);
                if (rankWithValue.length == 1) {
                    this.isFormFilled = true;
                } else {
                    this.isFormFilled = false;
                }
            },

            makeMultiSelection: function(option) {
                if (this.personalRank[option.index] == 0) {
                    let rankWithValue = this.personalRank.filter(item => item != 0);
                    this.personalRank[option.index] = rankWithValue.length + 1;
                } else {
                    for (let i = 0; i < this.personalRank.length; i++) {
                        if (this.personalRank[i] > this.personalRank[option.index]) {
                            this.personalRank[i] -= 1;
                        }
                    }
                    this.personalRank[option.index] = 0;
                }

                for (let i = 0; i < this.personalRank.length; i++) {
                    this.options[i].personalRank = this.personalRank[i];
                }
                console.log(this.personalRank);

                let rankWithValue = this.personalRank.filter(item => item != 0);
                if (rankWithValue.length == this.personalRank.length) {
                    this.isFormFilled = true;
                } else {
                    this.isFormFilled = false;
                }
            },

            send: function() {
                console.log("docId: ", this.docId);
                const db = firebase.firestore();
                const votesRef = db.collection("rooms").doc(this.docId).collection("votes").doc();
                const newRoomId = this.docId;
                let completedSending = false;

                votesRef.set({
                    personalRank: this.personalRank,
                    date: new Date()
                }).then(function() {
                    //getUserAttendance
                    const db = firebase.firestore();
                    const userId = firebase.auth().currentUser.uid;
                    console.log("userId: ", userId);
                    const userRef = db.collection("users").doc(userId);
                    userRef.get().then(function(doc) {
                        let attendedRooms = [];
                        if (doc.exists) {
                            const userData = doc.data();
                            if (userData.attendedRooms != []) {
                                //Returning user
                                attendedRooms = userData.attendedRooms;
                                attendedRooms.unshift(newRoomId);
                                //updateUserAttendance
                                userRef.update({
                                    attendedRooms: attendedRooms,
                                    date: new Date()
                                }).then(function() {
                                    console.log("Successfully updated data");
                                    //dismiss
                                    completedSending = true;
                                }).catch(function(error) {
                                    console.error("Error writing document: ", error);
                                });
                                console.log("returning");

                            } else {
                                //New user
                                attendedRooms = [newRoomId];
                                //addUserAttendance
                                userRef.set({
                                    attendedRooms: attendedRooms,
                                    createdRooms: [],
                                    date: new Date()
                                }).then(function() {
                                    console.log("Successfully set data");
                                    //dismiss
                                    completedSending = true;
                                }).catch(function(error) {
                                    console.error("Error writing document: ", error);
                                });
                                console.log("new");

                            }
                        } else {
                            //Unknown user
                            attendedRooms = [newRoomId];
                            //addUserAttendance
                            userRef.set({
                                attendedRooms: attendedRooms,
                                createdRooms: [],
                                date: new Date()
                            }).then(function() {
                                console.log("Successfully set data");
                                //dismiss
                                completedSending = true;
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

                this.showForm = false;
                this.showResultView = true;
            },

            goToResult: function() {
                this.$router.push({
                    name: 'roomOutline',
                    query: {
                        hasVoted: true,
                        room: this.roomData,
                        docId: this.docId
                    }
                });
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

    #form li {
        list-style: none;
    }

    .primary-button:disabled {
        background: rgba(48, 79, 254, 0.38);
        cursor: default;
    }


    input[type=radio] {
        display: none;
    }

    .primary-radio {
        box-sizing: border-box;
        cursor: pointer;
        display: inline-block;
        padding: 5px 30px;
        position: relative;
        width: auto;
    }

    .primary-radio::before {
        border: 1px solid #304FFE;
        border-radius: 50%;
        content: '';
        display: block;
        height: 16px;
        left: 5px;
        margin-top: -8px;
        position: absolute;
        top: 50%;
        width: 16px;
    }

    .primary-radio::after {
        background: #304FFE;
        border-radius: 50%;
        content: '';
        display: block;
        height: 10px;
        left: 8px;
        margin-top: -5px;
        opacity: 0;
        position: absolute;
        top: 50%;
        width: 10px;
    }

    input[type=radio]:checked+.primary-radio::after {
        opacity: 1;
    }


    input[type=checkbox] {
        display: none;
    }

    .primary-checkbox {
        box-sizing: border-box;
        cursor: pointer;
        display: inline-block;
        padding: 5px 30px;
        position: relative;
        width: auto;
    }

    .primary-checkbox::before {
        border: 1px solid #304FFE;
        border-radius: 1px;
        content: '';
        display: block;
        height: 16px;
        left: 5px;
        margin-top: -8px;
        position: absolute;
        top: 50%;
        width: 16px;
    }

    .primary-checkbox::after {
        border-right: 2px solid #304FFE;
        border-bottom: 2px solid #304FFE;
        content: '';
        display: block;
        height: 12px;
        width: 6px;
        left: 10px;
        margin-top: -8px;
        opacity: 0;
        position: absolute;
        top: 50%;
        transform: rotate(45deg);
    }

    input[type=checkbox]:checked+.primary-checkbox::after {
        opacity: 1;
    }

    .personalrank-label {
        min-width: 60px;
        text-align: right;
        color: #2D4BF2;
    }

</style>
