<template>
    <div id="roomsetting-app" class="body-padding">
        <div class="content">
            <div class="result-section">
                <div class="result-small-section">
                    <p class="text-left supporting-text">タイトル</p>
                    <p class="text-left primary-text">{{ room.title }}</p>

                    <div class="result-small-section">
                        <p class="text-left supporting-text">説明</p>
                        <p class="text-left primary-text">{{ room.explanation }}</p>
                    </div>
                    <div class="result-small-section">
                        <p class="text-left supporting-text">選択肢</p>
                        <ul>
                            <li v-for="option in room.options">
                                <p class="text-left primary-text">{{ option }}</p>
                            </li>
                        </ul>
                    </div>
                    <div class="result-small-section">
                        <p class="text-left supporting-text">投票のルール</p>
                        <p class="text-left primary-text">{{ rule }}</p>
                    </div>
                    <div v-if="!hasSaved">
                        <div class="result-small-section">
                            <input type="checkbox" id="setting-checkbox" @change="changed()" v-bind:checked="shouldbePublic">
                            <label for="setting-checkbox" class="primary-checkbox">公開する</label>
                        </div>
                        <div class="result-small-section">

                            <button v-on:click="post" v-bind:disabled="!hasEdited" class="primary-button">保存</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="result-section">
                <p v-if="hasSaved" class="text-left primary-text">変更を保存済み</p>
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
