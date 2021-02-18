<template>
    <div id="home-app">
        <div class="content">
            <p>ErabeRuleは、多数決に加え様々なルールを使って投票ができる投票アプリです。</p>

            <button v-on:click="start">はじめる</button>

            <p>iOSアプリ版こちら</p>
            <a href="https://apps.apple.com/jp/app/eraberule/id1552835670">ErabeRule iOS版</a>

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

    .content {
        margin: 20px;
    }
    
    #home-app il {
        list-style: circle;
    }

</style>
