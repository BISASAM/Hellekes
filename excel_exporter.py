import xlsxwriter
from html.parser import HTMLParser
from datetime import datetime
import locale

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


def write_to_sheet(header, table):
    workbook = xlsxwriter.Workbook('test_export.xlsx')
    date_format = workbook.add_format()
    date_format.set_num_format(22)
    worksheet = workbook.add_worksheet()
    for c, column_data in enumerate(header):
        worksheet.write(0, c, column_data[0])
    for r, row_list in enumerate(table, start=1):
        for c, entry in enumerate(row_list):
            cell_type = ""
            print(entry)
            if "timestamp" in entry[1]:
                timestamp = int(entry[1]["timestamp"])
                worksheet.write_datetime(r, c, datetime.fromtimestamp(timestamp), date_format)
            elif "lockVersion" in entry[1].get("class", []):
                worksheet.write_number(r, c, int(entry[0]))             
            else:
                worksheet.write(r, c, entry[0])            
    workbook.close()


def parse_html_table(htmlText):
    p = HTMLTableParser()
    p.feed(htmlText)
    write_to_sheet(p.header, p.table)