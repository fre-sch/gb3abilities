function AbilityViewModel(node, ns) {
    this.ns = ns
    var _ns = "." + this.ns
    this.label = node.querySelector(_ns + "-label").textContent
    this.rarity = node.querySelector(_ns + "-rarity").textContent
    this.effect = node.querySelector(_ns + "-effect").textContent
    this.value = parseInt(node.querySelector(_ns + "-value").textContent)
    this.view = node
    node.classList.add(this.ns + "-rarity-" + this.rarity)
    node.querySelectorAll(_ns + "-source").forEach(function(src) {
        src.classList.add("badge")
        src.classList.add("badge-light")
    })
}
AbilityViewModel.prototype.indexValue = function(key) {
    var indexValue = this[key].toLowerCase()
    if (key == "label") {
        var v = indexValue[0]
        return {
            id: v,
            label: v}
    }
    else if (key == "effect") {
        return {
            id: indexValue.replace(/\W+/g, "-"),
            label: indexValue}
    }
}
AbilityViewModel.prototype.clearIndex = function() {
    var _ns = "." + this.ns
    var node = this.view.querySelector(_ns + "-index-section")
    if (node)
        this.view.removeChild(node)
}
AbilityViewModel.prototype.setIndex = function (index) {
    var tpl = document.createElement("template")
    tpl.innerHTML = (
            "<div id=\"index-$id\" class=\"$class\"><span>$label</span></div>"
        ).replace("$id", index.id)
        .replace("$class", this.ns + "-index-section")
        .replace("$label", index.label)
    this.view.insertBefore(tpl.content, this.view.firstChild)
}
AbilityViewModel.compareEffect = function(a, b) {
    var e = a.effect.localeCompare(b.effect)
    if (e != 0) return -e
    if (a.rarity=="special" && b.rarity=="special")
        return a.value - b.value
    if (a.rarity=="special") return 1
    if (b.rarity=="special") return -1
    return a.value - b.value
}
AbilityViewModel.compare = function(key) {
    if (key=="effect") {
        return AbilityViewModel.compareEffect
    }
    return function(a, b) {
        return a[key].localeCompare(b[key])
    }
}

Abilities = {
    listView: null,
    viewModels: [],
    init: function(node, ns) {
        var _ns = "." + ns
        this.listView = node
        this.listView.querySelectorAll(_ns).forEach(function(node) {
            this.viewModels.push(new AbilityViewModel(node, ns))
        }.bind(this))
    },
    sortBy: function(key, dir) {
        dir = (dir == "asc" ? 1 : -1)
        this.viewModels.sort(function(a, b) {
            return dir * AbilityViewModel.compare(key)(a, b)
        })
        for (var viewModel of this.viewModels) {
            // appending node that is already a child reorders children
            this.listView.appendChild(viewModel.view)
        }
    },
    indexBy: function(key) {
        var indices = []
        var lastIndex = null
        for (var viewModel of this.viewModels) {
            viewModel.clearIndex()
            var itemIndex = viewModel.indexValue(key)
            if (!lastIndex || itemIndex.id != lastIndex.id) {
                indices.push(itemIndex)
                lastIndex = itemIndex
                viewModel.setIndex(itemIndex)
            }
        }
        return indices
    }
}

function resetScrollspy() {
    $('[data-spy="scroll"]').each(function () {
        $(this).scrollspy('refresh')
    })
}

IndexView = {
    view: null,
    init: function(node) {
        this.view = node
    },
    update: function(indices) {
        var html = [
            '<li class="nav-item"><a class="nav-link" href="#index-top">top</a></li>'
        ]
        for (var index of indices) {
            html.push(this.indexHtml(index))
        }
        this.view.innerHTML = html.join("")
        resetScrollspy()
    },
    indexHtml: function(index) {
        return '<li class="nav-item">'
            + '<a class="nav-link" href="#index-' + index.id
            +'">' + index.label
            + '</a></li>'
    }
}


function init() {
    Abilities.init(document.querySelector("#ability-list"), "ability")
    IndexView.init(document.querySelector("#alpha-index-list"))
    Abilities.sortBy("label", "asc")
    IndexView.update(Abilities.indexBy("label"))

    $("#sort-name").click(function() {
        $(this).parent().parent().find("a.nav-link").removeClass("active")
        $(this).toggleClass("active")
        Abilities.sortBy("label", "asc")
        IndexView.update(Abilities.indexBy("label"))
    })
    $("#sort-ability").click(function() {
        $(this).parent().parent().find("a.nav-link").removeClass("active")
        $(this).toggleClass("active")
        Abilities.sortBy("effect")
        Abilities.indexBy("effect")
        IndexView.update([])
    })
}

$(init)
