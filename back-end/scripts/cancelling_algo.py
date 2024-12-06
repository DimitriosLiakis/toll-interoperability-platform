#!/usr/bin/env python3
import mysql.connector
from mysql.connector import Error
import heapq
import sys
import os
import time
import networkx as nx
import matplotlib.pyplot as plt

class Solution:
    def __init__(self):
        self.minQ = []
        self.maxQ = []

    def constructMinMaxQ(self, amount):
        for company, net_amount in amount.items():
            if net_amount == 0:
                continue
            if net_amount > 0:
                heapq.heappush(self.maxQ, (company, net_amount))
            else:
                heapq.heappush(self.minQ, (company, net_amount))

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
                heapq.heappush(self.minQ, (debtor, transaction_val))
            else:
                owed_amount = -maxDebitEntry[1]
                heapq.heappush(self.maxQ, (creditor, transaction_val))
            try:
                conn = mysql.connector.connect(
                    host='localhost',
                    user='root',
                    password='2002',
                    database='draft_b'
                )
                cursor = conn.cursor()


                cursor.execute("""UPDATE TotalDebts SET total_amount = %s where debtor_company_id = %s and creditor_company_id = %s""",
                               (owed_amount, debtor, creditor))
                conn.commit()
                cursor.close()
                conn.close()

            except Error as e:
                print(f"Error: {e}")
                sys.exit(1)

            # print(f"Company {debtor} pays {owed_amount:.2f} to Company {creditor}")

    def minCashFlow(self, graph):
        amount = {company: 0 for company in graph}

        for debtor, creditors in graph.items():
            for creditor, amt in creditors.items():
                amount[debtor] -= amt
                amount[creditor] += amt

        self.constructMinMaxQ(amount)
        self.solveTransaction()


def fill_graph(graph):
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='2002',
            database='draft_b'
        )
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM TotalDebts")
        results = cursor.fetchall()

        for row in results:
            debtor = row['debtor_company_id']
            creditor = row['creditor_company_id']
            amount = float(row['total_amount'])

            if debtor not in graph:
                graph[debtor] = {}
            graph[debtor][creditor] = amount

        # print("Graph populated from database:")
        # print(graph)

        cursor.execute("""UPDATE TotalDebts SET total_amount = 0.00""")
        conn.commit()
        cursor.close()
        conn.close()
        # time.sleep(10)

    except Error as e:
        print(f"Error: {e}")
        sys.exit(1)

def visualize_graph(graph, title, filename):
    """Visualize the graph using NetworkX and Matplotlib, excluding zero-cost edges."""
    G = nx.DiGraph()

    # Add edges only if the amount is greater than 0
    for debtor, creditors in graph.items():
        for creditor, amount in creditors.items():
            if amount > 0:  # Exclude edges with zero cost
                G.add_edge(debtor, creditor, weight=amount)

    # Adjust spring_layout parameters for better spacing
    pos = nx.spring_layout(G, k=1, scale=1)
    edge_labels = nx.get_edge_attributes(G, 'weight')

    plt.figure(figsize=(12, 10))
    nx.draw(G, pos, with_labels=True, node_color="lightblue", node_size=2000, font_size=10, font_weight="bold", arrowsize=20)
    nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels, font_size=8)

    # Save the figure to a specific directory
    output_dir = "./"  # Current directory for simplicity
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, f"{filename}.png")

    plt.savefig(output_path, format="png", dpi=300)
    plt.close()

    # Print the full file path for the Node.js script
    print(output_path)

if __name__ == "__main__":
    graph1 = {}
    graph2 = {}
    # print("filling the graph")
    fill_graph(graph1)

    # print("graph filled")
    # print("\nSolution:")
    S = Solution()
    S.minCashFlow(graph1)
    # print("we calculated the solution")
    fill_graph(graph2)
    visualize_graph(graph1, "Initial Debt Graph", "initial_debts")
    visualize_graph(graph2, "Final Debt Graph", "final_debts")
