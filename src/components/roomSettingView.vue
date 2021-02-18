<template>
    <div id="roomsetting-app">
        <p>タイトル</p>
        <p>{{ room.title }}</p>
        <p>説明</p>
        <p>{{ room.explanation }}</p>
        <p>選択肢</p>
        <ul>
            <li v-for="option in room.options">
                <p>{{ option }}</p>
            </li>
        </ul>
        <p>投票のルール</p>
        <p>{{ rule }}</p>

        <div v-if="!hasSaved">
            <input type="checkbox" id="setting-checkbox" @change="changed()" v-bind:checked="shouldbePublic">
            <label for="setting-checkbox">公開する</label>
            <button v-on:click="post" v-bind:disabled="!hasEdited">保存</button>
        </div>
        <p v-if="hasSaved">変更を保存済み</p>
    </div>
</template>

<script>
    import firebase from 'firebase';
    import 'firebase/firestore';

    export default {
        data: function() {
            return {
                room: {},
                docId: "",
                rule: "",
                shouldbePublic: true,
                hasEdited: false,
                hasSaved: false
            }
        },

        created: function() {
            this.room = this.$route.query.room;
            this.docId = this.$route.query.docId;
            this.rule = this.convertRuleNameToDisplayName(this.room.rule);
            if (this.room.state == "ongoing") {
                this.shouldbePublic = true;
            } else {
                this.shouldbePublic = false;
            }
        },

        methods: {
            changed: function() {
                this.shouldbePublic = !this.shouldbePublic;
                console.log("shouldBePublic: ", this.shouldbePublic);
                this.hasEdited = !this.hasEdited;
            },

            post: function() {
                let state = "ongoing";
                if (this.shouldbePublic) {
                    state = "ongoing";
                } else {
                    state = "closed"
                }

                const db = firebase.firestore();
                const roomRef = db.collection("rooms").doc(this.docId);
                roomRef.update({
                    state: state,
                    date: new Date()
                }).then(function() {
                    console.log("Successfully updated data");
                    //dismiss
                }).catch(function(error) {
                    console.error("Error writing document: ", error);
                });

                this.hasSaved = true;
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

    #roomsetting-app li {
        list-style: none;
    }

</style>
