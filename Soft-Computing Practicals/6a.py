import numpy as np
import matplotlib.pyplot as plt
from minisom import MiniSom

colors = np.array(
    [[0., 0., 0.],
     [0., 0., 1.],
     [0., 0., 0.5],
     [0.125, 0.529, 1.0],
     [0.33, 0.4, 0.67],
     [0.6, 0.5, 1.0],
     [0., 1., 0.],
     [1., 0., 0.],
     [0., 1., 1.],
     [1., 0., 1.],
     [1., 1., 0.],
     [1., 1., 1.],
     [0.33, 0.33, 0.33],
     [0.5, 0.5, 0.5],
     [0.66, 0.66, 0.66]]
)

color_names = [
    'black', 'blue', 'darkblue', 'skyblue',
    'greyblue', 'lilac', 'green', 'red',
    'cyan', 'violet', 'yellow', 'white',
    'darkgrey', 'mediumgrey', 'lightgrey'
]

som = MiniSom(30, 20, 3, sigma=1.0, learning_rate=0.05) 
som.train(colors, 400)

plt.imshow(som.distance_map().T, origin='lower')
plt.title('Color SOM')

for i, color in enumerate(colors):
    w = som.winner(color)
    plt.text(w[0], w[1], color_names[i], ha='center', va='center',
             bbox=dict(facecolor='white', alpha=0.5, lw=0))

plt.show()

