<template>
    <div id="search-app">
        <div class="home-section">
            <p>ルーム名を検索して投票に参加</p>
            <input type="text" v-model="enteredTitle" placeholder="ルーム名を入力" id="search-text-field" class="primary-textfield">

            <button v-on:click="searchButtonClicked" class="primary-button">検索</button>
        </div>

        <div v-if="showRecentRoomButton" class="home-section">
            <p>最近参加したルーム</p>
            <button v-on:click="recentRoomButtonClicked" class="card-button">{{ recentlyAttendedRoomTitle }}</button>
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
                attendedRooms: [],
                showRecentRoomButton: false,
                recentlyAttendedRoom: undefined,
                recentlyAttendedRoomTitle: "",
                recentlyAttendedRoomId: ""
            }
        },

        created: function() {
            this.getAttendedRooms();
        },

        watch: {
            attendedRooms: function() {
                if (this.attendedRooms.length > 0) {
                    this.setRecentRoomButton(this.attendedRooms[0]);
                    this.showRecentRoomButton = true;
                }
            }
        },

        methods: {
            getAttendedRooms: async function() {
                const userId = firebase.auth().currentUser.uid;
                console.log("userId: ", userId);
                const db = firebase.firestore();
                const userRef = db.collection("users").doc(userId);

                const userDoc = await userRef.get();
                console.log("userDoc: ", userDoc);
                this.attendedRooms = await userDoc.data().attendedRooms;
                await console.log("attendedRooms: ", this.attendedRooms);

                //                userRef.get().then(function(doc) {
                //                    if (doc.exists) {
                //                        console.log("C");
                //                        const userData = doc.data();
                //                        if (userData.attendedRooms != []) {
                //                            //Returning user
                //                            const attendedRooms = userData.attendedRooms;
                //                            console.log("D");
                //                            return attendedRooms;
                //                        } else {
                //                            //New user
                //                            console.log("E");
                //                            return [];
                //                        }
                //                    } else {
                //                        //Unknown user
                //                        console.log("F");
                //                        return [];
                //                    }
                //                }).catch(function(error) {
                //                    return [];
                //                    console.log("G");
                //                    console.error("Error getting document: ", error);
                //                });
            },

            setRecentRoomButton: async function(roomId) {
                const db = firebase.firestore();
                const roomRef = db.collection("rooms").doc(roomId);
                const roomDoc = await roomRef.get();
                this.recentlyAttendedRoom = await roomDoc.data();
                await console.log("recentlyAttendedRoom: ", this.recentlyAttendedRoom);
                this.recentlyAttendedRoomTitle = await this.recentlyAttendedRoom.title;
                this.recentlyAttendedRoomId = roomId;
            },

            searchButtonClicked: function() {
                this.$router.push({
                    name: 'roomOutline',
                    query: {
                        enteredTitle: this.enteredTitle,
                        hasVoted: false,
                        attendedRooms: this.attendedRooms
                    }
                });
            },

            recentRoomButtonClicked: function() {
                this.$router.push({
                    name: 'roomOutline',
                    query: {
                        hasVoted: true,
                        room: this.recentlyAttendedRoom,
                        docId: this.recentlyAttendedRoomId,
                    }
                });
            }
        }
    }

</script>

<style>
    body {
        user-select: none;
    }

    .primary-textfield {
        /*
        min-height: 33px;
        min-width: 220px;
        font-size: 11pt;
        */
        min-height: 37px;
        min-width: 244px;
        font-size: 16px;
        transform: scale(0.9);

        vertical-align: middle;
        border: solid 1px rgb(200, 200, 200);
        border-radius: 3px;
        margin: 5px 0;
        box-shadow: none;
    }

    .card-button {
        background: #FFFFFF;
        border: solid 1px #E2E2E2;
        color: rgb(20, 20, 20);
        padding: 5px 15px;
        border-radius: 3px;
        text-align: left;
        vertical-align: middle;
        font-size: 11pt;
        padding: 10px 5px;
        min-width: 200px;
    }

    .card-button:hover {
        background: #E0E0E0;
        cursor: pointer;
    }

</style>
