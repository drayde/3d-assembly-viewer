import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js'

const plusChar = "⊞"
const minusChar = "⊟"

// Setup the scene, camera, and renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xffffff );
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 15;

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );

document.body.appendChild(renderer.domElement);

// Setup the controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;


// Function to setup the assembly
function setupAssembly(assembly, scene) {
  const group = new THREE.Group();
  group.name = assembly.name;
  scene.add(group);

  const root = document.getElementById('root');
  setupNodeRecursive(assembly, group, root)
}

function setupNodeRecursive(dataItem, sceneParent, treeParent) {

  const hasChildren = dataItem.children ? true : false;
  const treeNode = addTreeItem(dataItem.name, treeParent, hasChildren);  

  if (hasChildren) {
    const sceneNode = setupSceneNodeGroup(dataItem, sceneParent);
    const treeParentNew = treeNode.querySelector('ul');
    dataItem.children.forEach(function(child) {
      setupNodeRecursive(child, sceneNode, treeParentNew);
    });
    assignSceneNodeToTreeItem(treeNode, sceneNode)
  }
  else {
    setupSceneNode(dataItem, sceneParent, function(sceneNode){
      assignSceneNodeToTreeItem(treeNode, sceneNode)
    });  
  }
  
}


// Function to add items
function addTreeItem(nodeName, treeParent, isGroup) {
  const newNode = document.createElement('li');
  newNode.id = nodeName;
  let nodeHTML = '<span class="treeitem-name">' + nodeName + '</span>';
  if (isGroup) {
    nodeHTML = '<span class="expand-icon">'+plusChar+'</span> ' + nodeHTML + '<ul></ul>';
  } 
  newNode.innerHTML = nodeHTML;
  treeParent.appendChild(newNode);
  return newNode;
}

function assignSceneNodeToTreeItem(treeItem, sceneNode) {
  if (!sceneNode) {
    console.log('no scene node attached to ', nodeName);
    return;
  }
  const span = treeItem.querySelector('.treeitem-name')
  span.onclick = function(e){
    const sNode = sceneNode;
    sNode.visible = !sNode.visible;
    if (sNode.visible) {
      e.target.classList.remove("invisible");
    }
    else {
      e.target.classList.add("invisible");
    }
  }
  return treeItem;
}

// Function to setup nodes in scene graph
function setupSceneNode(dataItem, parent, then) {
  let matrix = new THREE.Matrix4();
  matrix.set(...dataItem.matrix);
  if (dataItem.stl) {
    var loader = new STLLoader();
    loader.load(dataItem.stl, function (geometry) {
      const material = new THREE.MeshNormalMaterial();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = dataItem.name;
      mesh.applyMatrix4(matrix);
      parent.add(mesh);
      then(mesh);
    });
  } 
}

function setupSceneNodeGroup(dataItem, parent) {
  let matrix = new THREE.Matrix4();
  matrix.set(...dataItem.matrix);
  const group = new THREE.Group();
  group.name = dataItem.name;
  group.applyMatrix4(matrix);
  parent.add(group);
  return group;
}


function setupTreeView() {
  // Handle click events on tree nodes
  const tree = document.getElementById('tree');
  tree.addEventListener('click', function(e) {
      if (e.target.classList.contains('expand-icon')) {
          const children = e.target.parentElement.parentElement.querySelectorAll('ul');
          if (children.length > 0) {
              var child = children[0];
              if (child.classList.contains("hidden")) {
                  child.classList.remove("hidden");
                  e.target.textContent = plusChar;
              } else {
                  child.classList.add("hidden");
                  e.target.textContent = minusChar;
              }
          }
      }
  });
}




// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();


var data = {
  "name": "assembly",
  "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], 
  "children": 
    [
      { "name": "cube1", "stl": "cube1.stl", "matrix": [1, 0, 0, -2, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }, 
      { "name": "cube2", "stl": "cube2.stl", "matrix": [1, 0, 0, -1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }, 
      { "name": "group", "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], 
          "children": 
          [
            { "name": "cube3", "stl": "cube3.stl", "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }, 
            { "name": "cube4", "stl": "cube4.stl", "matrix": [1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }
          ] 
      }, 
      { "name": "cube5", "stl": "cube5.stl", "matrix": [1, 0, 0, 2, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }]
}

setupTreeView();
setupAssembly(data, scene);