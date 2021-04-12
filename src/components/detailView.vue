<template>
  <div id="detail-app" class="body-padding">
    <div class="home-content">
      <p class="page-title">本アプリの投票ルールの仕様</p>
      <div class="home-section">
        <h3 class="section-title text-left">マジョリティ・ジャッジメント</h3>
        <p class="primary-text text-left">
          マジョリティ・ジャッジメント(Majority Judgement)は、各候補に対して絶対評価で投票し中央値をその候補の評価とする決め方です。
          <br>
          <br>
          &lt;評価を表す語彙について&gt;
          <br>
          投票の際、評価を表す語彙も判断に影響します。本アプリのデフォルトの語彙は以下の６つですが、カスタマイズすることもできます。
        </p>
        <div class="common-language-div">
          <img src="../assets/common_language_degault.jpg" class="common-language-img">
        </div>
        <p class="primary-text text-left">
          数・言葉ともに編集できるので、投票内容に応じて全員ができるだけ共通の基準で判断できるように設定することが可能です。
          <br>
          <br>
          例えば、「良い」「普通」「悪い」の３つに設定して中立な立場を選択可能にしたり、「6」~「1」の６段階にして肯定的か否定的かどちらかの立場を取るよう促したりすることもできます。
          <br>
          <br>
          また、絵文字を活用して以下のように言葉を使わない方法で投票を作成することもできます。
        </p>
        <div class="common-language-div">
          <img src="../assets/common_language_custom.jpg" class="common-language-img">
        </div>
        <div class="break-between-topic"></div>
        <p class="primary-text text-left">
          &lt;タイブレーキングについて&gt;
          <br>
          投票の結果、中央値に該当する評価が複数の候補で同一となった場合、本アプリでは自動的に、最終的な評価と同じかそれより良い評価をつけた票の数を比較し、それらの票が多い方を高い順位とします。
          <br>
          <br>
          &lt;中央値が存在しない場合&gt;
          <br>
          投票者数が偶数の場合、中央値が存在しない(あるいは中央値が２つ存在する)場合があります。その場合、本アプリではその２つのうち低い方を最終的な評価とします。
        </p>
      </div>
      <div class="home-section">
        <h3 class="section-title text-left">参考文献</h3>
        <ul>
          <li class="primary-text text-left">
            坂井豊貴.　「決め方」の経済学&#x2014&#x2014「みんなの意見のまとめ方」を科学する.　３刷,　ダイヤモンド社,　2019,　222p.
          </li>
          <li class="primary-text text-left">
            坂井豊貴.　多数決を疑う　社会的選択理論とは何か.　13刷,　岩波書店,　2020,　180p.
          </li>
          <li class="primary-text text-left">
            Michel Balinski,　Rida Laraki.　"A theory of measuring, electing, and ranking".　PNAS.　<a href="https://www.pnas.org/content/104/21/8720" target="_blank" rel="noopener noreferrer" class="reference-link">https://www.pnas.org/content/104/21/8720</a>,　(参照2021-03-19)
          </li>
          <li class="primary-text text-left">
            山本芳嗣.　"1人1票からMajority Judgmentへ".　<a href="http://www.orsj.or.jp/archive2/or57-06/or57_6_295.pdf" target="_blank" rel="noopener noreferrer" class="reference-link">http://www.orsj.or.jp/archive2/or57-06/or57_6_295.pdf</a>,　(参照2021-03-19)
          </li>
          <li class="primary-text text-left">
            "Understanding Majority Judgement".　open agora.　<a href="https://blog.open-agora.com/en/understanding-majority-judgement-polling-in-slack/#references" target="_blank" rel="noopener noreferrer" class="reference-link">https://blog.open-agora.com/en/understanding-majority-judgement-polling-in-slack/#references</a>,　(参照2021-03-19)
          </li>
          <li class="primary-text text-left">
            Stephen Bosworth,　Anders Corr,　Stevan Leonard.　"Legislatures Elected by Evaluative Proportional Representation (EPR): An Algorithm".　JPR.　<a href="https://www.jpolrisk.com/legislatures-elected-by-evaluative-proportional-representation-epr-an-algorithm-v2/" target="_blank" rel="noopener noreferrer" class="reference-link">https://www.jpolrisk.com/legislatures-elected-by-evaluative-proportional-representation-epr-an-algorithm-v2/</a>,　(参照2021-03-19)
          </li>
        </ul>

      </div>
    </div>
  </div>
</template>

<script>
</script>

<style>
  @import "../assets/css/style.css";

  #detail-app li {
    margin: 10px 0;
  }

  #detail-app ul {
    margin: 5px 20px;
  }
</style>
