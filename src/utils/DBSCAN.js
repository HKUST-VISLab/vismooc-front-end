export class DBSCAN {

    /**
     * DBSCAN class construcotr
     * @constructor
     *
     * @param {Array} dataset
     * @param {number} epsilon
     * @param {number} minPts
     * @param {function} distanceFunction
     * @returns {DBSCAN}
     */
    constructor(dataset, epsilon, minPts, distanceFunction) {
        this.dataset = [];
        this.epsilon = 1;
        this.minPts = 2;
        this.distance = DBSCAN.euclideanDistance;
        this.clusters = [];
        this.noise = [];

        // temporary variables used during computation
        this.visited = [];
        this.assigned = [];
        this.datasetLength = 0;

        this.init(dataset, epsilon, minPts, distanceFunction);
    }

    /** ****************************************************************************/
    // public functions

    /**
     * Start clustering
     *
     * @param {Array} dataset
     * @param {number} epsilon
     * @param {number} minPts
     * @param {function} distanceFunction
     * @returns {undefined}
     * @access public
     */
    run(dataset, epsilon, minPts, distanceFunction) {
        this.init(dataset, epsilon, minPts, distanceFunction);

        for (let pointId = 0; pointId < this.datasetLength; pointId++) {
            // if point is not visited, check if it forms a cluster
            if (this.visited[pointId] !== 1) {
                this.visited[pointId] = 1;

                // if closest neighborhood is too small to form a cluster, mark as noise
                const neighbors = this.regionQuery(pointId);

                if (neighbors.length < this.minPts) {
                    this.noise.push(pointId);
                } else {
                    // create new cluster and add point
                    const clusterId = this.clusters.length;
                    this.clusters.push([]);
                    this.addToCluster(pointId, clusterId);

                    this.expandCluster(clusterId, neighbors);
                }
            }
        }

        return this.clusters;
    }

    /** ****************************************************************************/
    // protected functions

    /**
     * Set object properties
     *
     * @param {Array} dataset
     * @param {number} epsilon
     * @param {number} minPts
     * @param {function} distance
     * @returns {undefined}
     * @access protected
     */
    init(dataset, epsilon, minPts, distance) {
        if (dataset) {
            if (!(dataset instanceof Array)) {
                throw Error(`Dataset must be of type array, ${
                    typeof dataset} given`);
            }

            this.dataset = dataset;
            this.clusters = [];
            this.noise = [];

            this.datasetLength = dataset.length;
            this.visited = new Array(this.datasetLength);
            this.assigned = new Array(this.datasetLength);
        }

        if (epsilon) {
            this.epsilon = epsilon;
        }

        if (minPts) {
            this.minPts = minPts;
        }

        if (distance) {
            this.distance = distance;
        }
    }


    /**
     * Expand cluster to closest points of given neighborhood
     *
     * @param {number} clusterId
     * @param {Array} neighbors
     * @returns {undefined}
     * @access protected
     */
    expandCluster(clusterId, neighbors) {
        /**
         * It's very important to calculate length of neighbors array each time,
         * as the number of elements changes over time
         */
        for (let i = 0; i < neighbors.length; i++) {
            const pointId2 = neighbors[i];

            if (this.visited[pointId2] !== 1) {
                this.visited[pointId2] = 1;
                const neighbors2 = this.regionQuery(pointId2);

                if (neighbors2.length >= this.minPts) {
                    neighbors = DBSCAN.mergeArrays(neighbors, neighbors2);
                }
            }

            // add to cluster
            if (this.assigned[pointId2] !== 1) {
                this.addToCluster(pointId2, clusterId);
            }
        }
    }

    /**
     * Add new point to cluster
     *
     * @param {number} pointId
     * @param {number} clusterId
     */
    addToCluster(pointId, clusterId) {
        this.clusters[clusterId].push(pointId);
        this.assigned[pointId] = 1;
    }

    /**
     * Find all neighbors around given point
     *
     * @param {number} pointId,
     * @param {number} epsilon
     * @returns {Array}
     * @access protected
     */
    regionQuery(pointId) {
        const neighbors = [];

        for (let id = 0; id < this.datasetLength; id++) {
            const dist = this.distance(this.dataset[pointId], this.dataset[id]);
            if (dist < this.epsilon) {
                neighbors.push(id);
            }
        }

        return neighbors;
    }


    /** ****************************************************************************/
    // helpers

    /**
     * @param {Array} a
     * @param {Array} b
     * @returns {Array}
     * @access protected
     */
    static mergeArrays(a, b) {
        const len = b.length;

        for (let i = 0; i < len; i++) {
            const P = b[i];
            if (a.indexOf(P) < 0) {
                a.push(P);
            }
        }

        return a;
    }

    /**
     * Calculate euclidean distance in multidimensional space
     *
     * @param {Array} p
     * @param {Array} q
     * @returns {number}
     */
    static euclideanDistance(p, q) {
        let sum = 0;
        let i = Math.min(p.length, q.length);

        while (i--) {
            sum += (p[i] - q[i]) * (p[i] - q[i]);
        }

        return Math.sqrt(sum);
    }
}
