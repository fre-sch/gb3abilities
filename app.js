import { Data } from "./data.mjs"
import {
  h,
  Component,
  render,
} from "https://esm.run/preact"

const Link = (href, props, children) => h("a", {href, ...props}, children)

const AbilityItem = ({label, effect, value, sources}) => {
  return h("li", { class: "ability" }, [
    h("span", { class: "ability-label" }, label),
    h("span", { class: "ability-effect" }, `${effect}: `),
    h("span", { class: "ability-value" }, value),
    h("ul", { class: "ability-sources" }, [
      sources.map((source) =>
        h("li", { class: "ability-source badge text-bg-secondary" }, source)
      ),
    ]),
  ])
}

const IndexSection = (label, anchor) =>
  h(
    "li",
    { class: "index-section" },
    [
      h("a", {id: anchor, class: "badge bg-primary" }, " "),
      h("span", { class: "badge bg-primary" }, label),
    ]
  )

const AbilityList = (items) =>
  h(
    "ul",
    { class: "ability-list" },
    [...(function* (items) {
      for (let i = 0, cur = null, n = items.length; i < n; i++) {
        if (cur != items[i].label[0]) {
          cur = items[i].label[0]
          yield IndexSection(cur, `abilities/index-${cur}`)
        }
        yield AbilityItem(items[i])
      }
    })(items)]
  )

const effectSorted = (items) => {
  let sortfn = (a, b) =>
    a.effect === b.effect
      ? parseFloat(b.value) - parseFloat(a.value)
      : a.effect.localeCompare(b.effect, undefined, { sensitivity: "accent" })
  let result = [...items]
  result.sort(sortfn)
  return result
}

const AbilityListByEffect = (items) =>
  h("div", {class: "flex-grow-1"}, h("ul", { class: "ability-list" }, [
    ...(function* (items) {
      for (let i = 0, cur = null, n = items.length; i < n; i++) {
        if (cur != items[i].effect) {
          cur = items[i].effect
          yield IndexSection(cur.replace(/\W+/g, "-"))
        }
        yield AbilityItem(items[i])
      }
    })(effectSorted(items)),
  ]))


const AbilityIndex = (items) =>
  h(
    "nav",
    { id: "alpha-index", class: "nav nav-pills flex-column" }, [
      Link("#abilities", { class: "nav-link" }, "TOP"),
      ...items.reduce((agg, it) => {
        if (agg.indexOf(it.label[0]) == -1) agg.push(it.label[0]);
        return agg
      }, []).map(it => Link(`#abilities/index-${it}`, {class: "nav-link"}, it))
    ]
  )


const AbilityListByName = (items) => [
  h("div", { class: "flex-grow-1" }, AbilityList(items)),
  h("div", { class: "" }, AbilityIndex(items)),
]

const AbilityListMode = ({ items, route, ...props }) =>
  h(
    "div",
    { class: "d-flex" },
    /^#abilities\/by-effect/.test(route)
      ? AbilityListByEffect(items)
      : AbilityListByName(items)
  )

const AbilityListModeSwitch = () =>
  h(
    "footer",
    { class: "navbar fixed-bottom navbar-dark bg-dark" },
    h("div", {class:"container"}, h("nav", { class: "nav nav-pills nav-fill flex-grow-1" }, [
      Link("#abilities/by-ability", { class: "nav-link" }, "By Name"),
      Link("#abilities/by-effect", { class: "nav-link" }, "By Effect"),
    ]))
  )


const AbilitiesPage = ({ items, route, active, ...props }) => {
  return h(
    "div",
    {
      ...props,
      id: "abilities",
      class: `container gx-1 ${active ? "active" : "d-none"}`,
    },
    [
      AbilityListMode({ items, route }),
      AbilityListModeSwitch()
    ]
  )
}

const deriveReduceForResult = (items) => {
  const reduceFn = (agg, [result, base]) => {
    const match = result.match(/\[(.+)\](.+)/)
    const index = match !== null ? match[2].trim() : result
    const label = match !== null ? match[1].trim() : null
    if (agg[result] === undefined) {
      agg[result] = {result, index, label, bases: []}
    }
    agg[result].bases.push(base)
    return agg
  }
  const byResult = Object.values(items.reduce(reduceFn, {}))
  byResult.sort((a, b) =>
    a.index.localeCompare(b.index, undefined, { sensitivity: "accent" })
  )
  return byResult
}

const DeriveResult = (item) => {
  if (item.label === null) {
    return h("div", {class: "derive-result"}, item.result)
  }
  return h("div", { class: "derive-result" }, [
    item.index,
    h("span", {class: "badge bg-light"}, item.label)
  ])
}

const DeriveItem = (item) =>
  h("li", { class: "derive" }, [
    DeriveResult(item),
    h("div", null, [
      "Bases: ",
      ...item.bases.map((base) =>
        h("span", { class: "derive-base badge bg-secondary" }, base)
      ),
    ]),
  ])


const DeriveIndex = (items) =>
  h("nav", { id: "alpha-index", class: "nav nav-pills flex-column" }, [
    Link("#derives", { class: "nav-link" }, "TOP"),
    ...Object.keys(
      items.reduce((agg, it) => (
        { ...agg, [it.index[0]]: true }
      ), {})
    ).map(key => Link(`#derives/index-${key}`, { class: "nav-link" }, key)),
  ])

const DerivesPage = ({ items, route, active, ...props }) => {
  items = deriveReduceForResult(items)
  return h(
    "div",
    {
      ...props,
      id: "derives",
      class: `container gx-1 ${active ? "active" : "d-none"}`,
    },
    h("div", { class: "d-flex" }, [
      h(
        "ul",
        { id: "derives-list", class: "flex-grow-1" },
        ...(function* (items) {
          for (let i = 0, cur = null, n = items.length; i < n; i++) {
            if (cur != items[i].index[0]) {
              cur = items[i].index[0]
              yield IndexSection(cur, `derives/index-${cur}`)
            }
            yield DeriveItem(items[i])
          }
        })(items)
      ),
      h("div", null, DeriveIndex(items)),
    ])
  )
}

const preventDefault = (fn) => (ev) => {
  fn(ev)
  ev.preventDefault()
}

const filterStatus = (value) => {
  if (value === null)
    return "filter-off"
  if (value === false)
    return "filter-false"
  return "filter-true"
}

const PlacementFilter = ({ filter, toggleFilter }) =>
  h(
    "footer",
    { class: "navbar fixed-bottom navbar-dark bg-dark" },
    h(
      "div",
      { class: "container" },
      h("nav", { class: "nav flex-nowrap" }, [
        Link("#", { class: `nav-link ${filterStatus(filter.head)}`, onClick: preventDefault(() => toggleFilter("head"))}, h("div", {class: "parts-img head"}, "")),
        Link("#", { class: `nav-link ${filterStatus(filter.body)}`, onClick: preventDefault(() => toggleFilter("body"))}, h("div", {class: "parts-img body"}, "")),
        Link("#", { class: `nav-link ${filterStatus(filter.arms)}`, onClick: preventDefault(() => toggleFilter("arms"))}, h("div", {class: "parts-img arms"}, "")),
        Link("#", { class: `nav-link ${filterStatus(filter.legs)}`, onClick: preventDefault(() => toggleFilter("legs"))}, h("div", {class: "parts-img legs"}, "")),
        Link("#", { class: `nav-link ${filterStatus(filter.backpack)}`, onClick: preventDefault(() => toggleFilter("backpack"))}, h("div", {class: "parts-img backpack"}, "")),
        Link("#", { class: `nav-link ${filterStatus(filter.shield)}`, onClick: preventDefault(() => toggleFilter("shield"))}, h("div", {class: "parts-img shield"}, "")),
        Link("#", { class: `nav-link ${filterStatus(filter.melee)}`, onClick: preventDefault(() => toggleFilter("melee"))}, h("div", {class: "parts-img melee"}, "")),
        Link("#", { class: `nav-link ${filterStatus(filter.ranged)}`, onClick: preventDefault(() => toggleFilter("ranged"))}, h("div", {class: "parts-img ranged"}, "")),
      ])
    )
  )


const PlacementImages = (item) => [
  h("div", { class: `parts-img head ${item.head ? "yes" : "no"}` }),
  h("div", { class: `parts-img body ${item.body ? "yes" : "no"}` }),
  h("div", { class: `parts-img arms ${item.arms ? "yes" : "no"}` }),
  h("div", { class: `parts-img legs ${item.legs ? "yes" : "no"}` }),
  h("div", { class: `parts-img backpack ${item.backpack ? "yes" : "no"}` }),
  h("div", { class: `parts-img shield ${item.shield ? "yes" : "no"}` }),
  h("div", { class: `parts-img melee ${item.melee ? "yes" : "no"}` }),
  h("div", { class: `parts-img ranged ${item.ranged ? "yes" : "no"}` }),
]

const PlacementItems = ({ items }) =>
  h("div", {class: "pb-5"},
    items.map((item) =>
      h("div", { class: "row align-items-center" }, [
        h(
          "span",
          { class: "col-md-4 ability-label", title: item.ability },
          item.ability
        ),
        h("div", { class: "col ability-enabled" }, PlacementImages(item)),
      ])
    )
  )

const tricycle = (value) => {
  if (value === null)
    return false
  if (value === false)
    return true
  return null
}

class PlacementPage extends Component {
  constructor() {
    super()
    this.state = {
      filter: {
        head: null,
        body: null,
        arms: null,
        legs: null,
        backpack: null,
        shield: null,
        melee: null,
        ranged: null
      }
    }
  }
  toggleFilter(value) {
    console.log("toggleFilter", value)
    const { filter } = this.state
    filter[value] = tricycle(filter[value])
    this.setState({ filter })
  }
  itemFilter(filter) {
    return item => (
      (filter.head === null || item.head == filter.head)
      && (filter.body === null || item.body == filter.body)
      && (filter.arms === null || item.arms == filter.arms)
      && (filter.legs === null || item.legs == filter.legs)
      && (filter.backpack === null || item.backpack == filter.backpack)
      && (filter.shield === null || item.shield == filter.shield)
      && (filter.melee === null || item.melee == filter.melee)
      && (filter.ranged === null || item.ranged == filter.ranged)
    )
  }
  render({ active, items }, { filter }) {
    return h(
      "div",
      {
        id: "placement",
        class: `container ${active ? "active" : "d-none"}`,
      },
      [
        h(PlacementItems, { items: items.filter(this.itemFilter(filter)) }),
        h(PlacementFilter, { filter, toggleFilter: (value) => this.toggleFilter(value) })
      ]
    )
  }
}

class App extends Component {
  constructor() {
    super()
    this.state = {
      route: window.location.hash || "#abilities"
    }
  }
  componentDidMount() {
    window.addEventListener("hashchange", () => {
      this.setState({ route: window.location.hash })
    })
  }
  render(props, { route }) {
    return [
      AbilitiesPage({
        items: Data.abilities,
        route,
        active: /^#abilities/.test(route),
      }),
      DerivesPage({
        items: Data.derives,
        route,
        active: /^#derives/.test(route),
      }),
      h(PlacementPage, {
        items: Data.abilityPlacement,
        route,
        active: /^#placement/.test(route),
      }),
    ]
  }
}

console.info("app init", document.querySelector("#pages"), Data);
render(h(App), document.querySelector("#pages"))
