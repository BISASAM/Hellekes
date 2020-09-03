import xlsxwriter
from html.parser import HTMLParser
from datetime import datetime
import locale
import os
import platform

class HTMLTableParser(HTMLParser):
    def __init__(self):
        HTMLParser.__init__(self)
        self._in_td = False
        self._in_header = False
        self._in_body = False
        self._current_row = []
        self.table = []

    def handle_starttag(self, tag, attrs):
        if tag == 'thead':
            self._in_header = True
        elif tag == 'tbody':
            self._in_body = True
        elif tag in  ['th', 'td']:
            self._current_attrs = {}
            for attr in attrs:
                if attr[0] == "class":
                    self._current_attrs[attr[0]] = attr[1].split()
                else:
                    self._current_attrs[attr[0]] = attr[1]
            self._in_td = True

    def handle_data(self, data):
        if self._in_td:
            self._current_cell = (data.strip(), self._current_attrs)
    
    def handle_endtag(self, tag):
        if tag in ['th', 'td']:
            self._in_td = False
            self._current_row.append(self._current_cell)
        elif tag == 'tr':
            if self._in_header:
               self.header = self._current_row
               self._current_row = []
            elif self._in_body: 
                self.table.append(self._current_row)
                self._current_row = []
            else:
                raise AttributeError
        elif tag == 'thead':
            self._in_header = False
        elif tag == 'tbody':
            self._in_body = False


def get_visible_rows(row_setting):
    rows = []
    try:
        for x in row_setting.split(","):
            if "-" in x:
                y = x.split("-")
                start = int(y[0])
                stop = int(y[1])
                rows.extend(range(start, stop+1))
            else:
                rows.append(int(x))
    except ValueError:
        print(f"{x} cant be converted to a number")
    return rows
            
def encrypt_file(input_file, output_file, password):
    bit_version = platform.architecture()[0]
    if bit_version == "64bit":
        msoffice_crypt = "msoffice-crypt\msoffice-crypt-64.exe"
    elif bit_version == "32bit":
        msoffice_crypt = "msoffice-crypt\msoffice-crypt-32.exe"
    else:
        print(f"Unsupported Platform: {bit_version}")
        return -1
    return os.system(f'{msoffice_crypt} -e -p "{password}" {input_file} {output_file}')
        


def write_to_sheet(header, table, settings):
    password_mode = "password" in settings and len(settings["password"]) > 0
    filename = "temp.xlsx" if password_mode else 'export.xlsx'
    header_names = [{"header": h[0]} for h in header]
    workbook = xlsxwriter.Workbook(filename)

    #Formats
    date_format = workbook.add_format()
    date_format.set_num_format(22)
    currency_format = workbook.add_format()
    currency_format.set_num_format(8)
    mark_currency_format = workbook.add_format()
    mark_currency_format.set_num_format(8)
    mark_currency_format.set_bg_color("#C06464")
    mark_iban_format = workbook.add_format()
    mark_iban_format.set_bg_color("#C06464")
    mark_purpose_format = workbook.add_format()
    mark_purpose_format.set_bg_color("#C06464")
    mark_suspicious_format = workbook.add_format()
    mark_suspicious_format.set_bg_color("#C06464")
    mark_unsuspicious_format = workbook.add_format()
    mark_unsuspicious_format.set_bg_color("#02A546")
    
    worksheet = workbook.add_worksheet()
    column_widths = [len(h[0]) for h in header]
    for r, row_list in enumerate(table, start=1):
        for c, entry in enumerate(row_list):
            if len(entry[0]) > column_widths[c]:
                column_widths[c] = len(entry[0])
            classes = entry[1].get("class", [])
            if "timestamp" in entry[1]:
                timestamp = int(entry[1]["timestamp"])
                worksheet.write_datetime(r, c, datetime.fromtimestamp(timestamp), date_format)
            elif "scope" in entry[1]:
                worksheet.write_number(r, c, int(entry[0]))
            elif "amount" in classes:
                if "mark_transactionAmount" in classes:
                    worksheet.write(r, c, float(entry[0]), mark_currency_format)
                else:    
                    worksheet.write(r, c, float(entry[0]), currency_format)
                if (len(entry[0]) + 2) > column_widths[c]:
                    column_widths[c] = (len(entry[0]) + 2)
            elif "mark_Unsuspicious" in classes:
                worksheet.write(r, c, entry[0], mark_unsuspicious_format)
            elif "mark_Suspicious" in classes:
                worksheet.write(r, c, entry[0], mark_suspicious_format)
            elif "lockVersion" in classes:
                worksheet.write_number(r, c, int(entry[0]))
            elif settings["filter"] and "mark_purpose" in classes:
                worksheet.write(r, c, entry[0], mark_purpose_format)
            elif settings["filter"] and "mark_iban" in classes:
                worksheet.write(r, c, entry[0], mark_iban_format)
            else:
                worksheet.write(r, c, entry[0])
    worksheet.add_table(0,0,r,c,{'header_row': True, 'columns':header_names})
      
    for i, h in enumerate(header):
            width = column_widths[i] + int(column_widths[i]*0.18)
            classes = h[1].get("class", [])
            if settings["hide_columns"] and "hidden" in classes:
                worksheet.set_column(i, i, width, None, {'hidden': True}) 
            else:
                worksheet.set_column(i,i,width)
    workbook.close()

    if password_mode:
        if encrypt_file(filename, "export.xlsx", settings["password"]) == 0:
            os.remove(filename)
        else:
            print("Error encrypting file")
            raise Exception

def create_export(jsonData):
    header, table = parse_html_table(jsonData["table"])
    del jsonData["table"]
    #print(jsonData)
    write_to_sheet(header, table, jsonData)
    
def parse_html_table(htmlText):
    p = HTMLTableParser()
    p.feed(htmlText)
    return (p.header, p.table)