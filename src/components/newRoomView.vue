<template>
    <div id="newroom-app">
        <div v-if="!hasPosted">
            <p>タイトル</p>
            <input type="text" v-model="enteredTitle" placeholder="タイトルを入力">
            <p v-if="shouldChangeTitle">すでに使われているタイトルです。末尾に数字をつけるなどしてみてください。</p>

            <p>説明</p>
            <button v-on:click="addExplanation" v-if="!hasAddedExplanation">説明文を追加</button>
            <input type="text" v-model="enteredExplanation" placeholder="説明文を入力" v-if="hasAddedExplanation">

            <p>選択肢</p>
            <ul>
                <li v-for="option in enteredOptions">
                    <input type="text" v-model="option.text" placeholder="選択肢を入力">
                </li>
                <button v-on:click="addOption">選択肢を追加</button>
            </ul>

            <p>投票のルールを選択</p>
            <ul>
                <li v-for="rule in rulesArray">
                    <input type="radio" v-bind:id="rule.name" v-on:click="radioChecked(rule)">
                    <label v-bind:for="rule.name">{{ rule.displayName }}</label>
                    <p v-if="rule.checked">{{ rule.explanation }}</p>
                </li>
            </ul>

            <p>参加者は投票ルームのタイトルを入力することで検索できます。</p>
            <button v-on:click="sendButtonClicled" v-bind:disabled="!isFormFilled">公開</button>
        </div>
        <div v-if="hasPosted">
            <p>公開済み</p>
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
                }]
            }
        },

        watch: {
            enteredTitle: function() {
                this.isFormFilled = this.checkIfFormIsFilled();
            },
            enteredOptions: function() {
                this.isFormFilled = this.checkIfFormIsFilled();
            },
            selectedRule: function() {
                this.isFormFilled = this.checkIfFormIsFilled();
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

            removeBlanks: function(enteredOptions) {
                let options = enteredOptions.slice();
                for (let i = 0; i < options.length; i++) {
                    if (options[i].text == "") {
                        options.splice(i, 1);
                    }
                }
                return options;
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
                    console.log("checkedRule: ", checkedRule);
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

            checkIfFormIsFilled: function() {
                let isFilled = true;
                if (this.enteredTitle == undefined || this.enteredTitle == "") {
                    isFilled = false;
                }
                if (this.removeBlanks(this.enteredOptions).length < 1) {
                    isFilled = false;
                }
                if (this.selectedRule == undefined) {
                    isFilled = false;
                }
                return isFilled;
            },

            sendButtonClicled: function() {
                console.log("enteredTitle: ", this.enteredTitle);
                console.log("enteredExplanation: ", this.enteredExplanation);
                console.log("selectedRule: ", this.selectedRule);

                const options = this.generateOptionsArray();
                let explanation = "";
                if (this.enteredExplanation == undefined) {
                    explanation = "";
                } else {
                    explanation = this.enteredExplanation;
                }
                console.log("explanation: ", explanation);
                this.send(options, explanation);
            },

            generateOptionsArray: function() {
                let options = [];
                for (let i = 0; i < this.enteredOptions.length; i++) {
                    options.push(this.enteredOptions[i].text);
                }
                return options;
            },

            send: function(options, explanation) {
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
                    }

                    //send
                    const db = firebase.firestore();
                    const roomRef = db.collection("rooms").doc();
                    const newRoomId = roomRef.id;
                    console.log("newRoomId: ", newRoomId);
                    const userId = firebase.auth().currentUser.uid;
                    console.log("userId: ", userId);

                    roomRef.set({
                        title: this.enteredTitle,
                        explanation: explanation,
                        options: options,
                        rule: this.selectedRule,
                        state: "ongoing",
                        senderId: userId,
                        date: new Date()

                    }).then(function() {

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

                });

                this.hasPosted = true;
            }
        }
    }

</script>

<style>
    body {
        user-select: none;
    }

    #newroom-app li {
        list-style: none;
    }

</style>
