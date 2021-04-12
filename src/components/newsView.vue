<template>
  <div id="news-app" class="body-padding">
    <div class="home-content">
      <p class="page-title">リリースノート</p>
      <div class="home-section">
        <ul class="text-left">
          <div class="news">
            <p class="supporting-text">2021/3/9</p>
            <li class="primary-text">「結果の検証を表示」ボタンの追加。
              <br>結果の画面で、他の投票ルールを採用していたらどのような結果になっていたか、シュミレーションできます。
              ボルダルールまたはコンドルセ・ヤングの最尤法で集計されたルームのみで表示されます。
            </li>
          </div>

          <div class="news">
            <p class="supporting-text">2021/3/7</p>
            <li class="primary-text">投票済みの人数が正しく表示されないことがあるバグを修正。</li>
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
