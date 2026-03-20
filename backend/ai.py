from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_ai_response(message, expenses):
    if len(expenses) == 0:
        expense_summary = "No expenses recorded yet."
    else:
        expense_summary = "\n".join([
            f"{e.get('category', 'Other')} ₹{e.get('amount', 0)} on {e.get('date', '-')}. Description: {e.get('description', '-')}"
            for e in expenses
        ])

    instructions = """
    You are a premium fintech AI assistant.
    Act like a clear, modern financial copilot.
    Keep answers concise, practical, and user-friendly.
    Focus on spending habits, budgeting, savings, category analysis, and financial behavior.
    Do not use markdown tables.
    """

    user_input = f"""
    User question:
    {message}

    Expense data:
    {expense_summary}
    """

    response = client.responses.create(
        model="gpt-5",
        instructions=instructions,
        input=user_input
    )

    return response.output_text