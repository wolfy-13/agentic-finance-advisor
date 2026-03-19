from openai import OpenAI
import os

# ✅ Initialize OpenAI client
client = OpenAI(api_key="sk-abc123xyz")


# 🧠 Rule-based advice (fallback / fast)
def get_advice(total):
    if total > 30000:
        return "You are overspending. Reduce shopping and entertainment."
    elif total > 20000:
        return "Spending is moderate. Maintain balance."
    else:
        return "Great! You are saving well."


# 🔮 Predict next month expense
def predict_expense(expenses):
    if len(expenses) == 0:
        return 0

    amounts = [float(e["amount"]) for e in expenses]
    total = sum(amounts)
    avg = total / len(amounts)

    return int(avg * 30 * 1.1)  # simple prediction


# 🤖 Real AI response (OpenAI)
def get_ai_response(message, expenses):

    if len(expenses) == 0:
        return "No expense data available. Add some expenses first."

    # Format data
    summary = "\n".join([
        f"{e['category']} ₹{e['amount']} on {e['date']}"
        for e in expenses
    ])

    total = sum([float(e["amount"]) for e in expenses])
    prediction = predict_expense(expenses)

    prompt = f"""
    You are a smart financial AI assistant.

    User expenses:
    {summary}

    Total spending: ₹{total}
    Predicted next month spending: ₹{prediction}

    Answer the user's question:
    {message}

    Give:
    - Short insights
    - Practical advice
    - Clear suggestions
    """

    try:
        res = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}]
        )

        return res.choices[0].message.content

    except Exception as e:
        # fallback if API fails
        return get_advice(total)