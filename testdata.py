import json
from stl import mesh
import numpy as np

# Generate STL files
def create_cube(filename, translate_vector):
    # Define the 8 vertices of the cube
    vertices = np.array([\
        [-0.5, -0.5, -0.5],
        [+0.5, -0.5, -0.5],
        [+0.5, +0.5, -0.5],
        [-0.5, +0.5, -0.5],
        [-0.5, -0.5, +0.5],
        [+0.5, -0.5, +0.5],
        [+0.5, +0.5, +0.5],
        [-0.5, +0.5, +0.5]])
    # Apply translation
    vertices += translate_vector
    # Define the 12 triangles composing the cube
    faces = np.array([\
        [0,3,1],
        [1,3,2],
        [0,4,7],
        [0,7,3],
        [4,5,6],
        [4,6,7],
        [5,1,2],
        [5,2,6],
        [2,3,6],
        [3,7,6],
        [0,1,5],
        [0,5,4]])

    # Create the mesh
    cube = mesh.Mesh(np.zeros(faces.shape[0], dtype=mesh.Mesh.dtype))
    for i, f in enumerate(faces):
        for j in range(3):
            cube.vectors[i][j] = vertices[f[j],:]

    # Write the mesh to file
    cube.save(filename)

create_cube('cube1.stl', np.array([-2, 0, 0]))
create_cube('cube2.stl', np.array([-1, 0, 0]))
create_cube('cube3.stl', np.array([0, 0, 0]))
create_cube('cube4.stl', np.array([1, 0, 0]))
create_cube('cube5.stl', np.array([2, 0, 0]))

# Create JSON file
assembly = {
    "name": "assembly",
    "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], # identity matrix
    "children": [
        {
            "name": "cube1",
            "stl": "cube1.stl",
            "matrix": [1, 0, 0, -2, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] # translate left
        },
        {
            "name": "cube2",
            "stl": "cube2.stl",
            "matrix": [1, 0, 0, -1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] # translate left
        },
        {
            "name": "group",
            "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], # identity matrix
            "children": [
                {
                    "name": "cube3",
                    "stl": "cube3.stl",
                    "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] # no translation
                },
                {
                    "name": "cube4",
                    "stl": "cube4.stl",
                    "matrix": [1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] # translate right
                },
            ]
        },
        {
            "name": "cube5",
            "stl": "cube5.stl",
            "matrix": [1, 0, 0, 2, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] # translate right
        }
    ]
}

with open('assembly.json', 'w') as f:
    json.dump(assembly, f)
