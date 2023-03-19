const nodes = document.querySelectorAll('.node');
nodes.forEach(node => {
    node.onmousedown = function(event) {
        let shiftX = event.clientX - node.getBoundingClientRect().left;
        let shiftY = event.clientY - node.getBoundingClientRect().top;

        node.classList.add('node-selected'); // Add the selected class

        function moveAt(pageX, pageY) {
            node.style.left = pageX - shiftX + 'px';
            node.style.top = pageY - shiftY + 'px';
        }

        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);

            // Snap to closest node or page boundaries
            snapToClosest(node);
        }

        document.addEventListener('mousemove', onMouseMove);

        node.onmouseup = function() {
            document.removeEventListener('mousemove', onMouseMove);
            node.onmouseup = null;

            // Remove the snap indicator when the node is dropped
            const existingIndicator = document.querySelector(".snap-indicator");
            if (existingIndicator) {
              existingIndicator.remove();
            }

            node.classList.remove('node-selected'); // Remove the selected class

            // Remove the alignment highlight
            const highlightedNode = document.querySelector('.node-align-highlight');
            if (highlightedNode) {
              highlightedNode.classList.remove('node-align-highlight');
            }
        };
    };

    node.ondragstart = function() {
        return false;
    };
});

function snapToClosest(draggedNode) {
  const SNAP_THRESHOLD = 20; // The distance threshold for snapping

  let minDistance = Infinity;
  let closestNode = null;
  let snapPosition = null;

  const draggedNodeRect = draggedNode.getBoundingClientRect();
  
    // Check if snapping to the page edges
  const edgeDistances = [
    { type: "page-left", value: draggedNodeRect.left },
    { type: "page-right", value: 800 - draggedNodeRect.right },
    { type: "page-center", value: Math.abs(400 - (draggedNodeRect.left + draggedNodeRect.width / 2)) },
  ];

  edgeDistances.forEach(({ type, value }) => {
    if (value < minDistance && value < SNAP_THRESHOLD) {
      minDistance = value;
      snapPosition = type;
    }
  });

  nodes.forEach((node) => {
    if (node === draggedNode) return;

    const nodeRect = node.getBoundingClientRect();

    // Calculate distances for each edge
    const leftDist = Math.abs(nodeRect.left - draggedNodeRect.right);
    const rightDist = Math.abs(nodeRect.right - draggedNodeRect.left);
    const centerDistX = Math.abs(
      (nodeRect.left + nodeRect.width / 2) -
        (draggedNodeRect.left + draggedNodeRect.width / 2)
    );

    const topDist = Math.abs(nodeRect.top - draggedNodeRect.bottom);
    const bottomDist = Math.abs(nodeRect.bottom - draggedNodeRect.top);
    const centerDistY = Math.abs(
      (nodeRect.top + nodeRect.height / 2) -
        (draggedNodeRect.top + draggedNodeRect.height / 2)
    );

    const edgeDistances = [
      { type: "left", value: leftDist },
      { type: "right", value: rightDist },
      { type: "center-x", value: centerDistX },
      { type: "top", value: topDist },
      { type: "bottom", value: bottomDist },
      { type: "center-y", value: centerDistY },
    ];

    // Find the closest node and snap position
    edgeDistances.forEach(({ type, value }) => {
      if (value < minDistance && value < SNAP_THRESHOLD) {
        minDistance = value;
        closestNode = node;
        snapPosition = type;
      }
    });
  });
	
  // Snap to the closest node or page boundaries
  if (closestNode) {
    const closestNodeRect = closestNode.getBoundingClientRect();

    // Update the dragged node's position based on the closest node and snap position
    switch (snapPosition) {
      case "left":
        draggedNode.style.left = closestNodeRect.left - draggedNodeRect.width + "px";
        break;
      case "right":
        draggedNode.style.left = closestNodeRect.right + "px";
        break;
      case "center-x":
        draggedNode.style.left =
          closestNodeRect.left +
          (closestNodeRect.width - draggedNodeRect.width) / 2 +
          "px";
        break;
      case "top":
        draggedNode.style.top = closestNodeRect.top - draggedNodeRect.height + "px";
        break;
      case "bottom":
        draggedNode.style.top = closestNodeRect.bottom + "px";
        break;
      case "center-y":
        draggedNode.style.top =
          closestNodeRect.top +
          (closestNodeRect.height - draggedNodeRect.height) / 2 +
          "px";
        break;
    }
  } else {
    // Snap to page boundaries
		switch (snapPosition) {
      case "page-left":
        draggedNode.style.left = "0px";
        break;
      case "page-right":
        draggedNode.style.left = 800 - draggedNodeRect.width + "px";
        break;
      case "page-center":
        draggedNode.style.left = 400 - draggedNodeRect.width / 2 + "px";
        break;
    }
  }

  if (draggedNodeRect.top < SNAP_THRESHOLD) {
    draggedNode.style.top = "0px";
  } else if (600 - draggedNodeRect.bottom < SNAP_THRESHOLD){
    draggedNode.style.top = 600 - draggedNodeRect.height + "px";
  }

  // Add visual indicators for snapping areas
  showSnapIndicator(closestNode, snapPosition);
}

function showSnapIndicator(closestNode, snapPosition) {
  const highlightedNode = document.querySelector('.node-align-highlight');
  if (highlightedNode) {
    highlightedNode.classList.remove('node-align-highlight');
  }
  
  const indicator = document.createElement("div");
  indicator.style.position = "absolute";
  indicator.style.backgroundColor = "rgba(255, 0, 0, 0.3)"; // Use a semi-transparent red color

  if (closestNode) {
    const closestNodeRect = closestNode.getBoundingClientRect();

    switch (snapPosition) {
      case "left":
      case "right":
        indicator.style.width = "2px";
        indicator.style.height = closestNodeRect.height + "px";
        indicator.style.top = closestNodeRect.top + "px";
        indicator.style.left =
          snapPosition === "left"
            ? closestNodeRect.left - 1 + "px"
            : closestNodeRect.right - 1 + "px";
        break;
      case "center-x":
        indicator.style.width = "2px";
        indicator.style.height = closestNodeRect.height + "px";
        indicator.style.top = closestNodeRect.top + "px";
        indicator.style.left = closestNodeRect.left + closestNodeRect.width / 2 - 1 + "px";
        break;
      case "top":
      case "bottom":
        indicator.style.width = closestNodeRect.width + "px";
        indicator.style.height = "2px";
        indicator.style.left = closestNodeRect.left + "px";
        indicator.style.top =
          snapPosition === "top"
            ? closestNodeRect.top - 1 + "px"
            : closestNodeRect.bottom - 1 + "px";
        break;
      case "center-y":
        indicator.style.width = closestNodeRect.width + "px";
        indicator.style.height = "2px";
        indicator.style.left = closestNodeRect.left + "px";
        indicator.style.top = closestNodeRect.top + closestNodeRect.height / 2 - 1 + "px";
        break;
    }
  } else if (snapPosition === "page-left" || snapPosition === "page-right" || snapPosition === "page-center") {
    indicator.style.width = "2px";
    indicator.style.height = "100%";
    indicator.style.top = "0px";

    switch (snapPosition) {
      case "page-left":
        indicator.style.left = "0px";
        break;
      case "page-right":
        indicator.style.left = 800 - 2 + "px";
        break;
      case "page-center":
        indicator.style.left = 400 - 1 + "px";
        break;
    }
  } else {
    // No closest node found; remove any existing indicator
    const existingIndicator = document.querySelector(".snap-indicator");
    if (existingIndicator) {
      existingIndicator.remove();
    }
    return;
  }

  indicator.classList.add("snap-indicator");
  const existingIndicator = document.querySelector(".snap-indicator");

  if (existingIndicator) {
    existingIndicator.remove();
  }
  
  if (closestNode) {
    closestNode.classList.add('node-align-highlight'); // Add the alignment highlight class
  }

  document.body.appendChild(indicator);
}
