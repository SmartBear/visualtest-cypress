const flattenTree = dom => {
    const flat = [];
    const traverse = node => {
        if (node == null) {
            console.log('node is null')
            return;
        }
        if (node.children) {
            node.children.forEach(child => {
                traverse(child);
            })
            delete node.children;
            flat.push(node);
        } else {
            flat.push(node);
        }
    }

    traverse(dom);
    return flat;
}

module.exports = flattenTree;