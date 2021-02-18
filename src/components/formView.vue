<template>
    <div id="form">
        <p>タイトル</p>
        <p>{{ title }}</p>
        <div v-if="showForm">

            <p v-if="hasExplanation">説明</p>
            <p v-if="hasExplanation">{{ explanation }}</p>

            <p>選択肢（支持する順に選んで順位をつけます。）</p>

            <ul>
                <li v-for="option in options">
                    <input type="checkbox" v-bind:id="option.name + option.index" v-model="option.checked" @change="changed(option)" v-if="isCheckBoxStyle">
                    <input type="radio" v-bind:id="option.name + option.index" v-model="option.checked" v-on:click="radioChecked(option)" v-if="isRadioStyle">
                    <label v-bind:for="option.name + option.index">{{ option.name }}</label>
                    <label v-bind:for="option.name + option.index" v-if="showRankLabel && option.personalRank != 0">{{ option.personalRank }}</label>
                </li>
            </ul>

            <p>この投票は{{ rule }}で集計されます。</p>

            <button v-bind:disabled="!isFormFilled" v-on:click="send">送信</button>
        </div>

        <div v-if="showResultView">
            <p>投票済み</p>
            <button v-on:click="goToResult">結果を見る</button>
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
                isRadioStyle: false,
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
                this.isRadioStyle = true;
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

            //            getUserAttendance: function() {
            // const db = firebase.firestore();
            // const userId = firebase.auth().currentUser.uid;
            // console.log("userId: ", userId);
            // const userRef = db.collection("users").doc(userId);
            // userRef.get().then(function(doc) {
            // let attendedRooms = [];
            // if (doc.exists) {
            // const userData = doc.data();
            // if (userData.attendedRooms != []) {
            // //Returning user
            // attendedRooms = userData.attendedRooms;
            // const newRoom = this.docId;
            // attendedRooms.unshift(newRoom);
            // this.updateUserAttendance(attendedRooms, userRef);
            // console.log("returning");
            // } else {
            // //New user
            // this.addUserAttendance(attendedRooms, userRef);
            // console.log("new");
            // }
            // } else {
            // //Unknown user
            // this.addUserAttendance(attendedRooms, userRef);
            // console.log("unknown");
            // }
            // }).catch(function(error) {
            // console.error("Error getting document: ", error);
            // });
            // },

            //            addUserAttendance: function(attendedRooms, userRef) {
            //                userRef.set({
            //                    attendedRooms: attendedRooms,
            //                    createdRooms: [],
            //                    date: new Date()
            //                }).then(function() {
            //                    console.log("Successfully set data")
            //                    //dismiss
            //                }).catch(function(error) {
            //                    console.error("Error writing document: ", error);
            //                });
            //            },

            //            updateUserAttendance: function(attendedRooms, userRef) {
            //                userRef.update({
            //                    attendedRooms: attendedRooms,
            //                    date: new Date()
            //                }).then(function() {
            //                    console.log("Successfully updated data")
            //                    //dismiss
            //                }).catch(function(error) {
            //                    console.error("Error writing document: ", error);
            //                });
            //            },

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

</style>
