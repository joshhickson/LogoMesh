import { onCLS, onINP, onFCP, onLCP, onTTFB, CLSMetric, INPMetric, FCPMetric, LCPMetric, TTFBMetric } from 'web-vitals';

type ReportHandler = (metric: CLSMetric | INPMetric | FCPMetric | LCPMetric | TTFBMetric) => void;

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    onCLS(onPerfEntry);
    onINP(onPerfEntry);
    onFCP(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
  }
};

export default reportWebVitals;
