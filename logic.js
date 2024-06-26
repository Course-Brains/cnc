class Player {
    constructor() {
        this.cities = [/*City*/]
    }
}
// Field id definition
const Fields = {
    housing_cap: 0,
    resource_cap: 1,
}
// id conversion
function field_id_to_field(id) {
    switch (id) {
        case 0:
            return "housing_cap"
        case 1:
            return "resource_cap"
        default:
            console.error("Invalid field id("+id+")")
    }
}
class City {
    constructor() {
        this.name = "" // name of the city
        // List of races(id) and their population
        this.pop = [/*[id, amount]*/]
        this.shamans = [/*Shaman*/]
        this.highest_race = 0 // race id
        this.housing_cap = 1 // max number of people housed
        this.buildings = [/*extends Building*/]
        this.structures = [/*Structure*/]
        this.raw_resources = [/*Structure*/]
        this.resources = [/*Resource*/]
        this.resource_cap = 0 // max number of resources stored
        this.tiles = [/*id*/]
    }
    check() {
        // Checks if there is enough pop for each building
        let used_pop = 0
        this.buildings.forEach((building) => {
            used_pop += building.pop
        })
        if (used_pop > this.pop) {
            console.error("Not enough pop for buildings")
            return false
        }
        // Resources are non-negative
        this.resources.forEach((resource) => {
            if (resource.num < 0) {
                console.error(resource.name + " is negative: " + resource.num)
                return false
            }
        })
        // Needs to be updated to have accurate resource values
        this.update_highest_race()
        let race = this.gen_current_race_stats()
        // Building resource potential storage check
        let total = this.calc_total_resource
        this.buildings.forEach((building) => {
            building.prod.forEach((prod) => {
                total += (prod.num*building.pop*race.prod_mult)
            })
        })
        this.raw_resources.forEach((resource) => {
            resource.prod.forEach((prod) => {
                total += (prod.num*resource.pop*race.res_mult)
            })
        })
        if (total > this.resource_cap) {
            console.error("Not enough storage for produced goods")
            return false
        }
        // Building resource consumption availability check
        this.buildings.forEach((building) => {
            building.cons.forEach((cons) => {
                let index = this.find_resource_index(cons.name)
                if (this.resources[index].num < (cons.num*building.pop)) {
                    console.error("Not enough " + cons.name + " for turn's production")
                    return false
                }
            })
        })
        // additional checks can be added here
        return true
    }
    tick() {
        if (this.check()) {
            this.buildings_tick()
            this.raw_resource_tick()
        }
    }
    buildings_tick() {
        let mult = this.gen_current_race_stats().prod_mult
        this.buildings.forEach((building) => {
            building.tick(this, mult)
        })
    }
    raw_resource_tick() {
        let mult = this.gen_current_race_stats().res_mult
        this.raw_resources.forEach((resource) => {
            resource.tick(this, mult)
        })
    }
    calc_total_resource() {
        let total = 0
        this.resources.forEach((resource) => {
            total += resource.num
        })
        return total
    }
    find_resource_index(name) {
        for(let i = 0; i < this.resources.length; i++) {
            if (this.resources[i].name == name) {
                return i
            }
        }
    }
    update_highest_race() {
        let highest_id = 0
        let highest_pop = 0
        this.pop.forEach((item) => {
            if (item[1] > highest_pop) {
                highest_pop = item[1]
                highest_id = item[0]
            }
        })
        this.highest_race = highest_id
    }
    gen_current_race_stats() {
        race_id_to_race_stats(this.highest_id)
    }
}
class Shaman {
    constructor() {
        this.name = ""
        this.raceid = 0 // Race id
        this.xp = 0
        this.req_xp = 0
        this.mana = 0
        this.lvl = 0
        this.school = 0 // School id
    }
}
const Races = {
    homo_erectus: 0,
    human: 1,
}
function name_to_race_id(name) {
    switch (name) {
        case "homo_erectus": 0
        case "human": 1
    }
}
function race_id_to_race_stats(id) {
    switch (id) {
        case 0: return new RaceEffect()
        case 1: return new RaceEffect().set_res_mult(1.25)
    }
}
class RaceEffect {
    //0) Resource mult
        // mult
    //1) Prod mult
        // mult
    //2) Special actions
    //3) Passive stat gains
        // which stat
        // amount gained
    constructor() {
        this.res_mult = 1 // both need to be 1 by default so that there is no change
        this.prod_mult = 1
        this.spec_act = [] // Unimplemented
        this.stat = [] // Unimplemented
    }
    // Remember to return itself after modifying the values so that
    // they can be chained: new RaceEffect().set_res_mult(1.5).set_prod_mult(0.5)
    set_res_mult(value) {
        this.res_mult = value
        return this
    }
    set_prod_mult(value) {
        this.prod_mult = value
        return this
    }
}
// Buildings need to be class instances because
// they have to store how many people are
// working there.
class Building {
    constructor() {
        // Building name
        this.name = ""
        // The produced resources per 1 worker
        this.prod = [/*Resource*/]
        // The consumed resources per 1 worker
        this.cons = [/*Resource*/]
        // Number of workers
        this.pop = 0
        // Construction cost
        this.cost = [/*Resource*/]
    }
    tick(city, mult) {
        // Adding production to city resource
        this.prod.forEach((prod) => {
            let index = city.find_resource_index(prod.name)
            city.resources[index].num += (prod.num*this.pop*mult)
        })
        // Subtracting consumption from city resource
        this.cons.forEach((cons) => {
            let index = city.find_resource_index(cons.name)
            city.resources[index].num -= (cons.num*this.pop)
        })
    }
}
class Building_Stone extends Building {
    constructor() {
        this.name = "stone"
        // TODO: Set up production, consumption ratio, and construction cost
        this.prod = [new Resource().name("stone")]
        this.cons = [new Resource().name("tool_silex")]
        this.cost = []
    }
}
// Structures can be consts because
// they don't need to hold onto
// any data
class Structure {
    constructor(data) {
        // Name of the structure(string)
        this.name = data.name
        // Fields it changes([FieldChange])
        this.changes = data.changes
        // construction cost([Resource])
        this.cost = data.cost
    }
}
class FieldChange {
    constructor(target, change) {
        this.target = target
        this.change = change
    }
}
class Resource {
    constructor(name, num) {
        this.name = name
        this.num = num
    }
}
// Biome ids:
// 1: wetland("wet")
// 2: tropical rainforest("trop_rain")
// 3: tropical seasonal rainforest("trop_seas_rain")/tropical seasonal forest("trop_seas_for")
// TODO: fill out the rest of the names
class Tile {
    constructor(type) {
        switch (type) {
            case "wet"|0:
                this.food_forg = 5
                this.food_fish = 5
                this.food_hunt = 2
                this.wood = 1
                this.stone = 0
                this.straw = 1
                this.bone = 1
            case "trop_rain"|1:
                this.food_forg = 2
                this.food_fish = 1
                this.food_hunt = 3
                this.wood = 5
                this.stone = 0
                this.straw = 2
                this.bone = 2
            case "trop_seas_rain"|3|"trop_seas_for":
                this.food_forg = 3
                this.food_fish = 1
                this.food_hunt = 4
                this.wood = 6
                this.stone = 0
                this.straw = 3
                this.bone = 3
            case "temp_deci_rain"|4:
                this.food_forg = 2
                this.food_fish = 0
                this.food_hunt = 4
                this.wood = 6
                this.stone = 1
                this.straw = 1
                this.bone = 1
            case "grass":
                this.food_forg = 4
                this.food_fish = 0
                this.food_hunt = 3
                this.wood = 1
                this.stone = 0
                this.straw = 5
                this.bone = 2
            case "temp_rain":
                this.food_forg = 3
                this.food_fish = 2
                this.food_hunt = 5
                this.wood = 5
                this.stone = 0
                this.straw = 0
                this.bone = 0
            case "taiga":
                this.food_forg = 3
                this.food_fish = 0
                this.food_hunt = 4
                this.wood = 1
                this.stone = 6
                this.straw = 5
                this.bone = 0
            case "glacier":
                this.food_forg = 2
                this.food_fish = 0
                this.food_hunt = 1
                this.wood = 0
                this.stone = 8
                this.straw = 0
                this.bone = 3
            case "savanna":
                this.food_forg = 3
                this.food_fish = 2
                this.food_hunt = 3
                this.wood = 2
                this.stone = 2
                this.straw = 5
                this.bone = 3
            case "cold_des":
                this.food_forg = 0
                this.food_fish = 0
                this.food_hunt = 1
                this.wood = 0
                this.stone = 4
                this.straw = 0
                this.bone = 10
            case "hot_des":
                this.food_forg = 0
                this.food_fish = 0
                this.food_hunt = 1
                this.wood = 0
                this.stone = 4
                this.straw = 3
                this.bone = 9
            default:
                console.error("Invalid tile type: " + type)
        }
    }
}
// Structures must be defined down here because
// they need to be made after class definitions
const Structure_storage = new Structure({
    name: "storage",
    changes: [
        new FieldChange(Fields.resource_cap, 100)
    ],
    cost: [
        //TODO: Set construction cost
    ]
})