function circleIntersectsBounds(x, y, radius, bounds) {
  const closestX = Math.max(bounds.x, Math.min(x, bounds.x + bounds.width))
  const closestY = Math.max(bounds.y, Math.min(y, bounds.y + bounds.height))
  const dx = x - closestX
  const dy = y - closestY
  return dx * dx + dy * dy <= radius * radius
}

function containsPoint(bounds, point) {
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  )
}

function createNode(bounds, depth, capacity, maxDepth) {
  return {
    bounds,
    depth,
    capacity,
    maxDepth,
    points: [],
    children: null,
  }
}

function subdivide(node) {
  const { x, y, width, height } = node.bounds
  const halfW = width / 2
  const halfH = height / 2
  const depth = node.depth + 1

  node.children = [
    createNode({ x, y, width: halfW, height: halfH }, depth, node.capacity, node.maxDepth),
    createNode(
      { x: x + halfW, y, width: halfW, height: halfH },
      depth,
      node.capacity,
      node.maxDepth,
    ),
    createNode(
      { x, y: y + halfH, width: halfW, height: halfH },
      depth,
      node.capacity,
      node.maxDepth,
    ),
    createNode(
      { x: x + halfW, y: y + halfH, width: halfW, height: halfH },
      depth,
      node.capacity,
      node.maxDepth,
    ),
  ]
}

function childForPoint(node, point) {
  if (!node.children) return null

  const midX = node.bounds.x + node.bounds.width / 2
  const midY = node.bounds.y + node.bounds.height / 2
  const right = point.x >= midX
  const bottom = point.y >= midY
  const index = (bottom ? 2 : 0) + (right ? 1 : 0)
  return node.children[index]
}

function insertIntoNode(node, point) {
  if (!containsPoint(node.bounds, point)) return false

  if (node.children) {
    return insertIntoNode(childForPoint(node, point), point)
  }

  if (node.points.length < node.capacity || node.depth >= node.maxDepth) {
    node.points.push(point)
    return true
  }

  subdivide(node)
  const existingPoints = node.points
  node.points = []

  for (const existing of existingPoints) {
    insertIntoNode(childForPoint(node, existing), existing)
  }

  return insertIntoNode(childForPoint(node, point), point)
}

function queryNode(node, x, y, radius, results) {
  if (!circleIntersectsBounds(x, y, radius, node.bounds)) return

  if (node.children) {
    for (const child of node.children) {
      queryNode(child, x, y, radius, results)
    }
    return
  }

  const radiusSq = radius * radius
  for (const point of node.points) {
    const dx = point.x - x
    const dy = point.y - y
    if (dx * dx + dy * dy <= radiusSq) {
      results.push(point)
    }
  }
}

export function createQuadtree(bounds, capacity = 8, maxDepth = 8) {
  let root = createNode(bounds, 0, capacity, maxDepth)

  return {
    clear() {
      root = createNode(bounds, 0, capacity, maxDepth)
    },
    insert(point) {
      return insertIntoNode(root, point)
    },
    queryCircle(x, y, radius, results) {
      queryNode(root, x, y, radius, results)
      return results
    },
  }
}
