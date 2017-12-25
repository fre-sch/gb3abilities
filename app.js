_.templateSettings = {
  evaluate: /\{%(.+?)%\}/g,
  interpolate: /\{\{(.+?)\}\}/g
}
if (!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length-1]
    }
}

function itemSortIndex(sortKey, itemData) {
    var itemSortValue = itemData[sortKey].toLowerCase()
    if (sortKey == "l") {
        var v = itemSortValue[0]
        return {
            id: v,
            label: v}
    }
    else if (sortKey == "e") {
        return {
            id: itemSortValue.replace(/\W+/g, "-"),
            label: itemSortValue}
    }
}

function resetScrollspy() {
    $('[data-spy="scroll"]').each(function () {
        $(this).scrollspy('refresh')
    })
}

function renderAbilities(abilityListView, alphaIndexView, sortKey) {
    GB3.sortBy(sortKey, sortKey=="e"?"desc":"asc")
    var indices = []

    var abilityItemViews = []
    for (var itemData of GB3.Abilities) {
        var itemIndex = itemSortIndex(sortKey, itemData)
        var item = {index: null}
        if (itemIndex.id != indices.last()) {
            indices.push(itemIndex.id)
            item.index = itemIndex
        }
        _.extend(item, itemData)
        abilityItemViews.push(abilityListView.template(item))
    }

    var indexViews = [
        alphaIndexView.template({it: "top"})
    ]
    if (sortKey == "l") {
        for (var idx of indices) {
            indexViews.push(alphaIndexView.template({it: idx}))
        }
    }

    alphaIndexView.$.html(indexViews)
    abilityListView.$.html(abilityItemViews)
    resetScrollspy()
}

function init() {
    var abilityListView = {
        template: _.template($("#ability-template").html(), {variable:"it"}),
        $: $("#ability-list")
    }
    var alphaIndexView = {
        template: _.template($("#index-template").html()),
        $: $("#alpha-index-list")
    }

    renderAbilities(abilityListView, alphaIndexView, "l")

    $("#sort-name").click(function() {
        $(this).parent().parent().find("a.nav-link").removeClass("active")
        $(this).toggleClass("active")
        renderAbilities(abilityListView, alphaIndexView, "l")
    })
    $("#sort-ability").click(function() {
        $(this).parent().parent().find("a.nav-link").removeClass("active")
        $(this).toggleClass("active")
        renderAbilities(abilityListView, alphaIndexView, "e")
    })
}

$(init)
