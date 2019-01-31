using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;

namespace WebApplication1.Models
{
    public class DayEntity
    {
        public DayOfWeek DOW { get; set; }
        public int Value { get; set; }
        public string Text { get; set; }

        public string ToString()
        {
            StringBuilder sb = new StringBuilder();
            sb.AppendLine($"DOM: {this.DOW.ToString()}");
            sb.AppendLine($"Value: {this.Value.ToString()}");
            sb.AppendLine($"Text: {this.Text}");
            return sb.ToString();
        }
    }
}