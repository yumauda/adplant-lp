
jQuery(function ($) { // この中であればWordpressでも「$」が使用可能になる

  var topBtn = $('.pagetop');
  topBtn.hide();

  // ヘッダーのスクロール時の表示/非表示
  var header = $('.p-header');
  var headerHeight = header.outerHeight();
  var startPos = 0;

  $(window).scroll(function () {
    var currentPos = $(this).scrollTop();

    // ページトップボタンの表示設定
    if (currentPos > 70) {
      // 指定px以上のスクロールでボタンを表示
      topBtn.fadeIn();
    } else {
      // 画面が指定pxより上ならボタンを非表示
      topBtn.fadeOut();
    }

    // ヘッダーの表示/非表示
    if (currentPos > startPos && currentPos > headerHeight) {
      // 下スクロール時：ヘッダーを非表示
      header.addClass('is-hidden');
    } else {
      // 上スクロール時：ヘッダーを表示
      header.removeClass('is-hidden');
    }

    startPos = currentPos;
  });

  // ボタンをクリックしたらスクロールして上に戻る
  topBtn.click(function () {
    $('body,html').animate({
      scrollTop: 0
    }, 300, 'swing');
    return false;
  });

  //ドロワーメニュー
  $("#MenuButton").click(function () {
    // $(".l-drawer-menu").toggleClass("is-show");
    // $(".p-drawer-menu").toggleClass("is-show");
    $(".js-drawer-open").toggleClass("open");
    $(".drawer-menu").toggleClass("open");
    $("html").toggleClass("is-fixed");

  });

  //ドロワーメニューのアコーディオン
  $(".js-drawer-accordion").click(function (e) {
    e.preventDefault();
    $(this).toggleClass("is-active");
    $(this).next(".drawer-menu__mega-lists").slideToggle(300);
  });



  // スムーススクロール (絶対パスのリンク先が現在のページであった場合でも作動)

  $(document).on('click', 'a[href*="#"]', function () {
    let time = 400;
    let header = $('header').innerHeight();
    let target = $(this.hash);
    if (!target.length) return;
    let targetY = target.offset().top - header;
    $('html,body').animate({ scrollTop: targetY }, time, 'swing');
    return false;
  });

  // videoクリックで再生/一時停止
  $('video').on('click', function() {
    if (this.paused) {
      this.play();
    } else {
      this.pause();
    }
  });

});
