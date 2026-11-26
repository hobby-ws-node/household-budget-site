export function renderDonut(data, width, height, title, symbol = '$') {
  const radius = Math.min(width, height) / 2 - 30;
  const cx = width / 2;
  const cy = height / 2;
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('class', 'donut-chart');

  const colors = [
    '#4F46E5', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#F97316', '#6366F1',
    '#84CC16', '#A855F7',
  ];

  let startAngle = -Math.PI / 2;

  data.forEach((d, i) => {
    const sliceAngle = (d.value / total) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const largeArc = sliceAngle > Math.PI ? 1 : 0;
    const dString = `
      M ${cx} ${cy}
      L ${cx + radius * Math.cos(startAngle)} ${cy + radius * Math.sin(startAngle)}
      A ${radius} ${radius} 0 ${largeArc} 1 ${cx + radius * Math.cos(endAngle)} ${cy + radius * Math.sin(endAngle)}
      Z
    `;
    path.setAttribute('d', dString);
    path.setAttribute('fill', colors[i % colors.length]);
    svg.appendChild(path);

    startAngle = endAngle;
  });

  const titleElem = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  titleElem.setAttribute('x', width / 2);
  titleElem.setAttribute('y', 20);
  titleElem.setAttribute('text-anchor', 'middle');
  titleElem.setAttribute('font-size', '14px');
  titleElem.setAttribute('font-weight', '600');
  titleElem.setAttribute('fill', '#1a1a1a');
  titleElem.textContent = title;
  svg.appendChild(titleElem);

  return svg;
}

export function renderBarChart(data, width, height, title, symbol = '$') {
  const barWidth = 34;
  const barSpacing = 12;
  const topMargin = 34;
  const bottomMargin = 28;
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const chartTop = topMargin;
  const chartBottom = height - bottomMargin;
  const barMaxHeight = chartBottom - chartTop;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('class', 'bar-chart');

  const colors = [
    '#4F46E5', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#F97316', '#6366F1',
    '#84CC16', '#A855F7',
  ];

  const bars = data.map((d, i) => {
    const barHeight = (d.value / maxValue) * barMaxHeight;
    const x = 10 + i * (barWidth + barSpacing);
    const y = chartBottom - barHeight;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', barWidth);
    rect.setAttribute('height', barHeight);
    rect.setAttribute('fill', colors[i % colors.length]);
    rect.setAttribute('rx', 3);
    svg.appendChild(rect);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', x + barWidth / 2);
    label.setAttribute('y', height - 8);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-size', '11px');
    label.setAttribute('fill', '#1a1a1a');
    label.textContent = d.label;
    svg.appendChild(label);

    const value = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    value.setAttribute('x', x + barWidth / 2);
    value.setAttribute('y', y - 6);
    value.setAttribute('text-anchor', 'middle');
    value.setAttribute('font-size', '11px');
    value.setAttribute('fill', '#EF4444');
    value.textContent = `${symbol}${Math.round(d.value)}`;
    svg.appendChild(value);

    return { x, y, width: barWidth, height: barHeight, label: d.label, value: d.value };
  });

  const titleElem = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  titleElem.setAttribute('x', width / 2);
  titleElem.setAttribute('y', 16);
  titleElem.setAttribute('text-anchor', 'middle');
  titleElem.setAttribute('font-size', '14px');
  titleElem.setAttribute('font-weight', '600');
  titleElem.setAttribute('fill', '#1a1a1a');
  titleElem.textContent = title;
  svg.appendChild(titleElem);

  const axisY = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  axisY.setAttribute('x1', 10);
  axisY.setAttribute('y1', chartBottom);
  axisY.setAttribute('x2', width - 10);
  axisY.setAttribute('y2', chartBottom);
  axisY.setAttribute('stroke', '#ddd');
  axisY.setAttribute('stroke-width', '1');
  svg.appendChild(axisY);

  return svg;
}