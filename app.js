function format(string, values) {
    return string.replace(/\{([^\}]+)\}/g, function(m, p){
        return values[p] || m
    })
}
function AbilityViewModel(node, ns) {
    this.ns = ns
    var _ns = "." + this.ns
    this.label = node.querySelector(_ns + "-label").textContent
    this.effect = node.querySelector(_ns + "-effect").textContent
    this.value = parseInt(node.querySelector(_ns + "-value").textContent)
    this.view = node
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
    tpl.innerHTML = format(
        '<div class="{class}"><a id="index-{id}"></a><span>{label}</span></div>',
        {id: index.id, label: index.label, class: this.ns + "-index-section"}
    )
    this.view.insertBefore(tpl.content, this.view.firstChild)
}
AbilityViewModel.compareEffect = function(a, b) {
    var e = a.effect.localeCompare(b.effect)
    if (e != 0) return -e
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
    view: null,
    viewModels: [],
    init: function(node, ns) {
        var _ns = "." + ns
        this.view = node
        this.view.querySelectorAll(_ns).forEach(function(node) {
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
            this.view.appendChild(viewModel.view)
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
            '<li class="nav-item"><a class="nav-link" href="#">top</a></li>'
        ]
        for (var index of indices) {
            html.push(this.indexHtml(index))
        }
        this.view.innerHTML = html.join("")
        resetScrollspy()
    },
    indexHtml: function(index) {
        return format(
            '<li class="nav-item"><a class="nav-link" href="#index-{id}">{label}</a></li>',
            index)
    }
}

function navLinkSetActive(linkElement) {
    $(linkElement).parents("nav").find(".nav-link").removeClass("active")
    $(linkElement).toggleClass("active")
}


function init() {
    Abilities.init(document.querySelector("#ability-list"), "ability")
    IndexView.init(document.querySelector("#alpha-index-list"))
    Abilities.sortBy("label", "asc")
    IndexView.update(Abilities.indexBy("label"))

    $("#sort-name").click(function() {
        navLinkSetActive(this)
        Abilities.sortBy("label", "asc")
        IndexView.update(Abilities.indexBy("label"))
    })
    $("#sort-ability").click(function() {
        navLinkSetActive(this)
        Abilities.sortBy("effect")
        Abilities.indexBy("effect")
        IndexView.update([])
    })

    $("#primary-navbar .nav-link").click(function(e) {
        e.preventDefault()
        var page = $(this).attr("href")
        $(page).show().siblings().hide()
        navLinkSetActive(this)
    })
    $(".derive-base").addClass(["badge", "badge-light"])
}

$(init)
