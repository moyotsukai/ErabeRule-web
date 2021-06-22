<template>
  <div id="news-app" class="body-padding">
    <div class="home-content">
      <p class="page-title">現在確認しているバグ</p>
      <div class="home-section">
        <ul class="text-left">
          <div class="news">
            <li class="primary-text">
              ボルダルールまたはコンドルセルールで、選択肢を11個以上入力すると投票の結果が表示できないバグが発生しています。ご不便をおかけしていますが、現在修正に取り組んでいます。
            </li>
          </div>
        </ul>
      </div>

      <p class="page-title">リリースノート</p>
      <div class="home-section">
        <ul class="text-left">
          <div class="news">
            <p class="supporting-text">2021/06/22</p>
            <li class="primary-text">
              「結果を検証」の新機能
              <br />
              マジョリティ・ジャッジメントで集計されたルームの結果の画面で、「結果の検証」ボタンを押すと、もし平均を使っていたらどんな結果になっていたかシュミレーションできます。
              マジョリティ・ジャッジメントは中央値を使っているのが特徴ですが、単純な平均値と比べてどのくらい戦略的操作をされにくいのか、比較する参考になるのではないかと思います。
            </li>
          </div>

          <div class="news">
            <p class="supporting-text">2021/04/12</p>
            <li class="primary-text">
              マジョリティ・ジャッジメント(Majority Judgement)を追加しました。
              <br />
              マジョリティ・ジャッジメントを採用して投票ルームを作成する場合、評価を表す語彙(「非常に良い」「不十分」など)をカスタマイズすることもできます。
            </li>
          </div>

          <div class="news">
            <p class="supporting-text">2021/03/09</p>
            <li class="primary-text">
              「結果の検証を表示」ボタンの追加。
              <br />
              結果の画面で、他の投票ルールを採用していたらどのような結果になっていたか、シュミレーションできます。
              ボルダルールまたはコンドルセ・ヤングの最尤法で集計されたルームのみで表示されます。
            </li>
          </div>

          <div class="news">
            <p class="supporting-text">2021/03/07</p>
            <li class="primary-text">
              投票済みの人数が正しく表示されないことがあるバグを修正。
            </li>
          </div>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
</script>

<style>
@import "../assets/css/style.css";

#news-app li {
  list-style: none;
}

#news-app p {
  margin: 10px 0;
}
</style>
