import heapq

# Comparator that will be used to make priority_queue
# containing pair of integers maxHeap Comparison is based
# on second entry in the pair which represents cash
# credit/debit
class AscCmp:
    def __call__(self, p1, p2):
        return p1[1] < p2[1]

# Comparator that will be used to make priority_queue
# containing pair of integers minHeap Comparison is based
# on second entry in the pair which represents cash
# credit/debit
class DscCmp:
    def __call__(self, p1, p2):
        return p1[1] > p2[1]

class Solution:
    def __init__(self):
        self.minQ = []
        self.maxQ = []

    # This function will fill in minQ and maxQ in such a
    # way that maxQ will have only positive value. minQ
    # will have only negative value amount is taken as
    # input. amount[i] => cash credit/debit to/from person
    # i amount[i] == 0 will be ignored as no credit/debit
    # is left.
    def constructMinMaxQ(self, amount):
        for i in range(len(amount)):
            if amount[i] == 0:
                continue
            if amount[i] > 0:
                heapq.heappush(self.maxQ, (i, amount[i]))
            else:
                heapq.heappush(self.minQ, (i, amount[i]))

    # This function will iterate over minQ and maxQ until
    # empty. It will fetch max credit and min debit. If sum
    # of both is not equal to zero, then push remaining
    # credit or debit back to the required queue. At the
    # end of the loop, print result
    def solveTransaction(self):
        while self.minQ and self.maxQ:
            maxCreditEntry = heapq.heappop(self.maxQ)
            maxDebitEntry = heapq.heappop(self.minQ)

            transaction_val = maxCreditEntry[1] + maxDebitEntry[1]

            debtor = maxDebitEntry[0]
            creditor = maxCreditEntry[0]
            owed_amount = 0

            if transaction_val == 0:
                owed_amount = maxCreditEntry[1]
            elif transaction_val < 0:
                owed_amount = maxCreditEntry[1]
                heapq.heappush(self.minQ, (maxDebitEntry[0], transaction_val))
            else:
                owed_amount = -maxDebitEntry[1]
                heapq.heappush(self.maxQ, (maxCreditEntry[0], transaction_val))

            print(f"Person {debtor} pays {owed_amount} to Person {creditor}")

    def minCashFlow(self, graph):
        n = len(graph)

        # Calculate the cash to be credited/debited to/from
        # each person and store in vector amount
        amount = [0] * n
        for i in range(n):
            for j in range(n):
                diff = graph[j][i] - graph[i][j]
                amount[i] += diff

        # Fill in both queues minQ and maxQ using amount
        # vector
        self.constructMinMaxQ(amount)

        # Solve the transaction using minQ, maxQ and amount
        # vector
        self.solveTransaction()

# Test cases
graph1 = [
    [0, 1000, 0],
    [0, 0, 0],
    [0, 0, 0],
]

graph2 = [
    [2, 63, 0, 85, 49],
    [0, 76, 0, 0, 27],
    [0, 0, 0, 17, 0],
    [73, 32, 50, 6, 71],
    [0, 86, 0, 0, 10]
]

print("Solution 1:")
S = Solution()
S.minCashFlow(graph1)
print("\nSolution 2:")
S2 = Solution()
S2.minCashFlow(graph2)