class Neuron:
    def __init__(self, weights):
        self.weightv = weights
        self.activation = 0

    def act(self, m, x):
        a = sum(x[i] * self.weightv[i] for i in range(m))
        return a


class Network:
    def __init__(self, a, b, c, d):
        self.nrn = [Neuron(a), Neuron(b), Neuron(c), Neuron(d)]
        self.output = [0, 0, 0, 0]

    def threshld(self, k):
        if k >= 0:
            return 1
        else:
            return 0

    def activation(self, patrn):
        for i in range(4):
            for j in range(4):
                print(f"\n nrn[{i}].weightv[{j}] is {self.nrn[i].weightv[j]}")
            self.nrn[i].activation = self.nrn[i].act(4, patrn)
            print(f"\nactivation is {self.nrn[i].activation}")
            self.output[i] = self.threshld(self.nrn[i].activation)
            print(f"\noutput value is {self.output[i]}\n")


def main():
    patrn1 = [1, 0, 1, 0]
    wt1 = [0, -3, 3, -3]
    wt2 = [-3, 0, -3, 3]
    wt3 = [3, -3, 0, -3]
    wt4 = [-3, 3, -3, 0]

    print("\nTHIS PROGRAM IS FOR A HOPFIELD NETWORK WITH A SINGLE LAYER OF")
    print("\n4 FULLY INTERCONNECTED NEURONS. THE NETWORK SHOULD RECALL THE")
    print("\nPATTERNS 1010 AND 0101 CORRECTLY.\n")

    h1 = Network(wt1, wt2, wt3, wt4)

    h1.activation(patrn1)

    for i in range(4):
        if h1.output[i] == patrn1[i]:
            print(f"\n pattern= {patrn1[i]} output = {h1.output[i]} component matches")
        else:
            print(f"\n pattern= {patrn1[i]} output = {h1.output[i]} discrepancy occurred")
    print("\n\n")

    patrn2 = [0, 1, 0, 1]
    h1.activation(patrn2)

    for i in range(4):
        if h1.output[i] == patrn2[i]:
            print(f"\n pattern= {patrn2[i]} output = {h1.output[i]} component matches")
        else:
            print(f"\n pattern= {patrn2[i]} output = {h1.output[i]} discrepancy occurred")


if __name__ == "__main__":
    main()
