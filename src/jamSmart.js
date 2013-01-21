(function(window, undefined) {
    var document = window.document,
    navigator = window.navigator,
    location = window.location,
    screen = window.screen,
    history = window.history,

    $ = window.Sizzle,

    byId = document.getElementById,
    byName = document.getElementsByName,
    byTag = document.getElementsByTagName,
    byCss = document.getElementsByClassName,
    select = document.querySelectorAll,

    jam = window.jam,
    Event;

if (!jam) {
    return;
}
Event = jam.Event;
Css = jam.Css;

(function() {
    var labels = byTag.call(document, 'label');
    jam.each(labels, function(target) {
        Event.click(target, function() {});
    });
}());
}(window));
