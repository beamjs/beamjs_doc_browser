function Breadcrumbs(id) {
    var container = document.getElementById(id)
    var elements = container.innerHTML.split(".");
    var output = [], el, url = '';

    container.innerHTML = elements.shift();

    for (var i = 0; i < elements.length; i++) {
        url += ('/' + elements[i]);
        el = document.createElement('a');
        el.setAttribute('href', url);
        el.innerHTML += elements[i];
        container.innerHTML += '.'
        container.appendChild(el);
    }
}
