class Player {
    constructor() {
        this.cities = []
    }
}
// Field id definition
const Field_housing_cap = 0
const Field_resource_cap = 1
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
        this.name = ""
        this.pop = 0
        this.housing_cap = 1
        this.buildings = []
        this.structures = []
        this.resources = []
        this.resource_cap = 0
        this.tiles = []
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
        // Building resource potential storage check
        let total = this.calc_total_resource
        this.buildings.forEach((building) => {
            building.prod.forEach((prod) => {
                total += (prod.num*building.pop)
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
        }
    }
    buildings_tick() {
        this.buildings.forEach((building) => {
            building.tick(this)
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
}
// Buildings need to be classes because
// they have to store how many people are
// working there.
class Building {
    constructor() {
        // Building name
        this.name = ""
        // The produced resources per 1 worker
        this.prod = []
        // The consumed resources per 1 worker
        this.cons = []
        // Number of workers
        this.pop = 0
        // Construction cost
        this.cost = []
    }
    tick(city) {
        // Adding production to city resource
        this.prod.forEach((prod) => {
            let index = city.find_resource_index(prod.name)
            city.resources[index].num += (prod.num*this.pop)
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
class Tile {
    constructor(type) {
        switch (type) {
            case "wet":
                this.food_forg = 5
                this.food_fish = 5
                this.food_hunt = 2
                this.wood = 1
                this.stone = 0
                this.straw = 1
                this.bone = 1
            case "trop_rain":
                this.food_forg = 2
                this.food_fish = 1
                this.food_hunt = 3
                this.wood = 5
                this.stone = 0
                this.straw = 2
                this.bone = 2
            case "trop_seas_rain"|"trop_seas_for":
                this.food_forg = 3
                this.food_fish = 1
                this.food_hunt = 4
                this.wood = 6
                this.stone = 0
                this.straw = 3
                this.bone = 3
            case "temp_deci_rain":
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
// they need to be after class definitions
const Structure_storage = new Structure({
    name: "storage",
    changes: [
        new FieldChange(Field_resource_cap, 100)
    ],
    cost: [
        //TODO: Set construction cost
    ]
})