console.log("FINAL SUBMISSION VERSION RUNNING");

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/bfhl", (req, res) => {

    const data = req.body.data || [];

    let validEdges = [];
    let invalidEntries = [];

    for (let item of data) {
        if (typeof item !== "string" || item.length !== 4) {
            invalidEntries.push(item);
            continue;
        }

        if (item[1] !== "-" || item[2] !== ">") {
            invalidEntries.push(item);
            continue;
        }

        let p = item[0];
        let c = item[3];

        if (p < "A" || p > "Z" || c < "A" || c > "Z" || p === c) {
            invalidEntries.push(item);
            continue;
        }

        validEdges.push(item);
    }

    let uniqueEdges = [];
    let duplicateEdges = [];
    let seen = new Set();

    for (let edge of validEdges) {
        if (!seen.has(edge)) {
            seen.add(edge);
            uniqueEdges.push(edge);
        } else {
            if (!duplicateEdges.includes(edge)) {
                duplicateEdges.push(edge);
            }
        }
    }

    let graph = {};
    let nodes = new Set();
    let childSet = new Set();

    for (let edge of uniqueEdges) {
        let p = edge[0];
        let c = edge[3];

        nodes.add(p);
        nodes.add(c);

        if (!graph[p]) graph[p] = [];
        graph[p].push(c);

        childSet.add(c);
    }

    let roots = [];

    for (let n of nodes) {
        if (!childSet.has(n)) {
            roots.push(n);
        }
    }

    function detectCycle(node, visited, stack) {
        if (!visited[node]) {
            visited[node] = true;
            stack[node] = true;

            let children = graph[node] || [];

            for (let child of children) {
                if (!visited[child] && detectCycle(child, visited, stack)) {
                    return true;
                } else if (stack[child]) {
                    return true;
                }
            }
        }

        stack[node] = false;
        return false;
    }

    function buildTree(node, visited) {
        let obj = {};
        let children = graph[node] || [];

        for (let child of children) {
            if (!visited.has(child)) {
                visited.add(child);
                obj[child] = buildTree(child, visited);
            }
        }

        return obj;
    }

    function getDepth(node) {
        let children = graph[node] || [];

        if (children.length === 0) return 1;

        let maxDepth = 0;

        for (let child of children) {
            maxDepth = Math.max(maxDepth, getDepth(child));
        }

        return 1 + maxDepth;
    }

    let hierarchies = [];
    let totalTrees = 0;
    let totalCycles = 0;
    let largestDepth = 0;
    let largestRoot = "";

    let processed = new Set();

    // 🔹 Handle trees (roots)
    for (let root of roots) {

        processed.add(root);

        let visited = {};
        let stack = {};

        let isCycle = detectCycle(root, visited, stack);

        if (isCycle) {
            totalCycles++;

            hierarchies.push({
                root: root,
                tree: {},
                has_cycle: true
            });

        } else {
            totalTrees++;

            let tree = {};
            let visitSet = new Set([root]);
            tree[root] = buildTree(root, visitSet);

            let depth = getDepth(root);

            if (
                depth > largestDepth ||
                (depth === largestDepth && (largestRoot === "" || root < largestRoot))
            ) {
                largestDepth = depth;
                largestRoot = root;
            }

            hierarchies.push({
                root: root,
                tree: tree,
                depth: depth
            });
        }
    }

    // 🔹 Handle pure cycles (no roots)
    let visitedGlobal = new Set();

    for (let node of nodes) {
        if (!processed.has(node) && !visitedGlobal.has(node)) {

            let visited = {};
            let stack = {};

            let isCycle = detectCycle(node, visited, stack);

            if (isCycle) {
                totalCycles++;

                // collect all nodes in this cycle
                let cycleNodes = Object.keys(visited);
                cycleNodes.forEach(n => visitedGlobal.add(n));

                let root = cycleNodes.sort()[0]; // lexicographically smallest

                hierarchies.push({
                    root: root,
                    tree: {},
                    has_cycle: true
                });
            }
        }
    }

    res.json({
        user_id: "premsagar_01082006",
        email_id: "pp6671@srmist.edu.in",
        college_roll_number: "RA2311003010092",
        hierarchies: hierarchies,
        invalid_entries: invalidEntries,
        duplicate_edges: duplicateEdges,
        summary: {
            total_trees: totalTrees,
            total_cycles: totalCycles,
            largest_tree_root: largestRoot
        }
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});