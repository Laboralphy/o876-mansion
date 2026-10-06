import Thinker from "@/engine/thinkers/Thinker";


/**
 * this thinker is suitable for moving entities that do not interact with other tangible entities
 */
class StaticThinker extends Thinker {
    constructor() {
        super();
        this.automaton.defineStates({
            "main": {
            }
        });
    }
}

export default StaticThinker;