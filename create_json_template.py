import random as random
from datetime import datetime
import json

def create_random_id():
    return f"{create_random_str(8, True, False, True)}-{create_random_str(4, True, False, True)}-{create_random_str(4, True, False, True)}-{create_random_str(12, True, False, True)}"

def create_random_str(lenght, digits=True, uppercase=False, lowercase=False):
    selection = []
    if digits:
        selection.extend([str(i) for i in range(10)])
    if uppercase:
        selection.extend([chr(i) for i in range(65,91)])
    if lowercase:
        selection.extend([chr(i) for i in range(97,123)])
    result = ""
    for i in range(lenght):
        result += random.choice(selection)
    return result

def create_account(name, bank):
    if bank["country"] == "DE":
        iban = "DE" + create_random_str(20)
    elif bank["country"] == "RO":
        iban = "RO" + create_random_str(22)
    else:
        iban = bank["country"] + create_random_str(21)

    return account(iban=iban, bic=bank["bic"], accountHolder=name, accountSystem="AccountSystem", accountType="Giro", bankName=bank["name"], organizationId=bank["id"])

def account(iban, bic, accountHolder, accountSystem, accountType, bankName, organizationId):
    account_info = {
        "accountHolder": accountHolder,
        "accountSystem": accountSystem,
        "accountType": accountType,
        "bankName": bankName,
        "iban": iban,
        "bic": bic,
        "organizationId": organizationId,
        "financialAccountId": create_random_id()
    }
    return account_info

def create_transfer():
    date = datetime.fromtimestamp(random.randint(1400000000, 1597740271)).isoformat()
    date += f".{create_random_str(3)}+0000"
    sender = random.choice(accounts)
    accounts_without_sender = list(accounts)
    accounts_without_sender.remove(sender)
    receiver = random.choice(accounts_without_sender)
    ammount = str(random.choice(ammounts)) + "0"
    purpose = "Purpose_" + create_random_str(6, True, True, True)

    return transfer(date, ammount, sender, receiver, purpose)

def transfer(date, amount, sender_account, 
             receiver_account, purpose, lockVersion=0,
             bankTransferReportItemId=None, bankTransferId=None):
    
    if bankTransferReportItemId is None:
        bankTransferReportItemId = create_random_id()
    if bankTransferId is None:
        bankTransferId = create_random_id()
    
    return manual_transfer(createdDate=date, lastModifiedDate=date, 
                    lockVersion=lockVersion, organizationId=sender_account["organizationId"], 
                    bankTransferReportItemId=bankTransferReportItemId, 
                    bankTransferId=bankTransferId, 
                    financialAccountId=sender_account["financialAccountId"], 
                    amount=amount, bankTransferDate=date,
                    recipientIban=receiver_account["iban"], recipientBic=receiver_account["bic"], 
                    recipientName=receiver_account["accountHolder"], purpose=purpose, 
                    accountHolder=sender_account["accountHolder"],
                    accountSystem=sender_account["accountSystem"], 
                    accountType=sender_account["accountType"], bankName=sender_account["bankName"], 
                    iban=sender_account["iban"], bic=sender_account["bic"])
    
def manual_transfer(createdDate, organizationId, recipientIban, recipientBic, 
                    recipientName, purpose, accountHolder, accountSystem, amount,
                    accountType, bankName, iban, bic, lastModifiedDate=None, 
                    lockVersion=0, bankTransferReportItemId=None, bankTransferId=None, 
                    financialAccountId=None, bankTransferDate=None
                    ):
    transfer = {
        "createdDate": createdDate,
        "lastModifiedDate": lastModifiedDate,
        "lockVersion": lockVersion,
        "organizationId": organizationId,
        "bankTransferReportItemId": bankTransferReportItemId,
        "bankTransferId": bankTransferId,
        "financialAccountId": financialAccountId,
        "amount": amount,
        "bankTransferDate": bankTransferDate,
        "recipientIban": recipientIban,
        "recipientBic": recipientBic,
        "recipientName": recipientName,
        "purpose": purpose,
        "accountHolder": accountHolder,
        "accountSystem": accountSystem,
        "accountType": accountType,
        "bankName": bankName,
        "iban": iban,
        "bic": bic
    }
    return transfer

ammounts = [y*x for x in [10**i for i in range(8)] for y in [1.0,1.5,2.0,2.5,5.0,7.5]] 

banken =  [
    {"name":"Deutsche Bank", "bic":"DEUTDEDBBER", "country":"DE", "id":"vknrwgth-txzd-8cx7-smhponep31tq"},
    {"name":"Postbank", "bic":"PBNKDEFFXXX", "country":"DE", "id":"vx25ju6w-3z07-djqk-nq1ng5gn8fxe"},
    {"name":"Volksbank Breisgau Nord eG", "bic":"GENODE61EMM", "country":"DE", "id":"4t786zkg-khmn-7g6x-sb80vqku65b0"},
    {"name":"Sparkasse Freiburg", "bic":"FRSPDE66XXX", "country":"DE", "id":"9lyjxydg-845c-suas-y6x1h6w15vyv"},
    {"name":"COMMERZBANK AG", "bic":"COBADEBBXXX", "country":"DE", "id":"u6jebj5g-mfei-9n8w-bfgaw7aed40v"}, 
    {"name":"Banca Comercială Română S.A.", "bic":"RNCBROBUXXX", "country":"RO", "id":"hrrjfpum-55cv-9wmt-yxvdho7fqqb0"}
]

accounts = []
tiere = ["Affen", "Loewen", "Tiger", "Esel", "Pferde", "Hai"]
accounts.extend([create_account((t + " Company"), random.choice(banken)) for t in tiere])
namen = ["Tom Mueller", "Max Musterman", "Tina Schmitt", "Gerda Schneider"]
accounts.extend([create_account(n, random.choice(banken)) for n in namen])

data = {"transfers": []}

for i in range(1000):
    data["transfers"].append(create_transfer())

with open("json_template_2.json", 'w') as outfile:
    json.dump(data, outfile, indent=4)