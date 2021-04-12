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
 @import "../assets/css/style.css";
</style>
