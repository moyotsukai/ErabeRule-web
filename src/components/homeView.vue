<template>
    <div id="home-app">
        <div class="home-content">
            <div class="home-section">
                <p>ErabeRuleは、多数決に加え様々なルールを使って投票ができる投票アプリです。</p>
                <button v-on:click="start" class="primary-button">はじめる</button>
            </div>

            <div class="home-section">
                <p>iOSアプリ版こちら</p>
                <a href="https://apps.apple.com/jp/app/eraberule/id1552835670" class="primary-link">ErabeRule iOS版 ></a>
            </div>

            <div class="home-section text-left">
                <p>世の中には色々な投票ルールが存在する一方、多数決を使った投票では票割れによって漁夫の利的な勝利が発生することが知られています。しかし、ほとんどの場面では多数決しか採用されません。これにはいくつか理由がありますが、理由の一つにそもそもどのようなルールが存在するのか知られていないことが考えられます。使ったことのない方法を採用するのはハードルが高いのではないでしょうか。</p>

                <p>ErabeRuleは、様々な投票ルールをもっと身近なものにし、気軽に使ってみることを目的としています。学校の生徒会長を選ぶ選挙や、授業内での模擬選挙などに使ってみてはいかがでしょうか？</p>

                <p>現在利用できる投票ルール:</p>
                <ul>
                    <li>多数決</li>
                    <li>ボルダルール</li>
                    <li>コンドルセ・ヤングの最尤法</li>
                </ul>

                <p>ErabeRuleの特徴:</p>
                <ul>
                    <li>アカウント作成は必要ありません。</li>
                    <li>投票ルームの作成者は、上の３つのルールの中から１つ選んでルームを作成できます。</li>
                    <li>参加者は一人一票のみ投票できます。</li>
                    <li>結果はリアルタイムで画面に反映されます。</li>
                    <li>集計はアプリが自動で計算してくれるので、面倒な集計作業は必要はありません。</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        methods: {
            start: function() {
                this.$router.push({
                    path: 'attend'
                });
            }
        }
    }

</script>

<style>
    body {
        user-select: none;
    }

    .home-content {
        margin: 0 20px;
    }

    #home-app il {
        list-style: circle;
    }

    .home-section {
        margin: 60px 0;
    }

    .text-left {
        text-align: left;
    }

    .primary-button {
        color: #FFFFFF;
        background: #304FFE;
        border: none;
        padding: 5px 15px;
        border-radius: 3px;
        vertical-align: middle;
        font-size: 11pt;
    }

    .primary-button:hover {
        background: #4F68FC;
        cursor: pointer;
    }

    .primary-link {
        color: #2D4BF2;
        text-decoration: none;
        padding: 10px;
        margin: 5px;
        border-radius: 5px;
    }

    .primary-link:hover {
        background: rgba(0, 0, 0, 0.05);
    }
    
    #home-app ul {
        margin: 5px 20px;
    }

</style>
