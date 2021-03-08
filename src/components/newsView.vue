<template>
  <div id="news-app">
    <div class="home-content">
      <div class="home-section">
        <p class="page-title">リリースノート</p>
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
  body {
    user-select: none;
  }

  #news-app li {
    list-style: none;
  }

  #news-app p {
    margin: 10px 0;
  }

  .page-title {
    font-size: 15pt;
  }

  .news {
    margin: 20px 0;
  }

  .supporting-text {
    font-size: 10pt;
    color: #4c4c4c;
  }

  .primary-text {
    font-size: 12pt;
    color: #000000;
  }
</style>
