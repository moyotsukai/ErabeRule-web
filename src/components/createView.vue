<template>
    <div id="create-app">
        <div class="home-section">
            <p>新しい投票ルームを作成</p>
            <button v-on:click="createButtonClicked" class="primary-button">作成</button>
        </div>

        <div v-if="showRecentRoomButton" class="home-section">
            <p>最近作成したルーム</p>
            <button v-on:click="recentRoomButtonClicked" class="card-button">{{ recentlyCreatedRoomTitle }}</button>
        </div>
    </div>
</template>

<script>
    import firebase from 'firebase';
    import 'firebase/firestore';

    export default {
        data: function() {
            return {
                showRecentRoomButton: false,
                createdRooms: [],
                recentlyCreatedRoom: undefined,
                recentlyCreatedRoomTitle: "",
                recentlyCreatedRoomId: ""
            }
        },

        created: function() {
            this.getCreatedRooms();
        },

        watch: {
            createdRooms: function() {
                if (this.createdRooms.length > 0) {
                    this.setRecentRoomButton(this.createdRooms[0]);
                    this.showRecentRoomButton = true;
                }
            }
        },

        methods: {
            createButtonClicked: function() {
                this.$router.push({
                    path: 'newroom'
                });
            },

            getCreatedRooms: async function() {
                const userId = firebase.auth().currentUser.uid;
                console.log("userId: ", userId);
                const db = firebase.firestore();
                const userRef = db.collection("users").doc(userId);

                const userDoc = await userRef.get();
                console.log("userDoc: ", userDoc);
                this.createdRooms = await userDoc.data().createdRooms;
                await console.log("createdRooms: ", this.createdRooms);
            },

            setRecentRoomButton: async function(roomId) {
                const db = firebase.firestore();
                const roomRef = db.collection("rooms").doc(roomId);
                const roomDoc = await roomRef.get();
                this.recentlyCreatedRoom = await roomDoc.data();
                await console.log("recentlyCreatedRoom: ", this.recentlyCreatedRoom);
                this.recentlyCreatedRoomTitle = await this.recentlyCreatedRoom.title;
                this.recentlyCreatedRoomId = roomId;
            },

            recentRoomButtonClicked: function() {
                this.$router.push({
                    name: 'roomSetting',
                    query: {
                        room: this.recentlyCreatedRoom,
                        docId: this.recentlyCreatedRoomId,
                    }
                });
            }
        }
    }

</script>

<style>
  @import "../assets/css/style.css";
</style>
