(function loadPageTitle() {
    let pageTitle = "GlamorByBee";
    document.title = pageTitle;
})();

(function loadfavIcon() {
    var link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    link.href = 'https://stackoverflow.com/favicon.ico';
})();