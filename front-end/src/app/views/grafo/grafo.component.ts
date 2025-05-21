import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { TdService } from '../../services/td.service';
import * as d3 from 'd3';

// Tipo extendido para nodos jerárquicos
interface CustomHierarchyNode extends d3.HierarchyNode<any> {
  x0?: number;
  y0?: number;
  _children?: CustomHierarchyNode[];
  id?: string;
}

@Component({
  selector: 'app-grafo',
  standalone: true,
  imports: [],
  templateUrl: './grafo.component.html',
  styleUrl: './grafo.component.scss'
})
export class GrafoComponent implements OnInit {
 @ViewChild('treeContainer', { static: true }) container!: ElementRef;

  constructor(private tdService: TdService) {}

  ngOnInit(): void {
    const data = this.tdService.obtenerTD();
    const hierarchy = this.buildHierarchy(data);
    this.renderTree(hierarchy);
  }

  buildHierarchy(obj: any, name: string = 'TD'): any {
    const children: any[] = [];

    Object.entries(obj).forEach(([key, value]) => {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        children.push(this.buildHierarchy(value, key));
      } else {
        children.push({ name: `${key}: ${value}` });
      }
    });

    return { name, children };
  }

  renderTree(data: any) {
    const width = 900;
    const dx = 20;
    const dy = 160;
    const duration = 300;

    const tree = d3.tree().nodeSize([dx, dy]);
    const root: CustomHierarchyNode = d3.hierarchy(data) as CustomHierarchyNode;
    root.x0 = dx;
    root.y0 = 0;

    let index = 0;

    const svg = d3.select(this.container.nativeElement)
      .append('svg')
      .attr('viewBox', [-dy / 2, -dx, width, dx * 40])
      .style('font', '12px sans-serif')
      .style('user-select', 'none');

    const gLink = svg.append('g')
      .attr('fill', 'none')
      .attr('stroke', '#aaa')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5);

    const gNode = svg.append('g')
      .attr('cursor', 'pointer');

    const diagonal = d3.linkHorizontal()
      .x((d: any) => d.y)
      .y((d: any) => d.x);

    const update = (source: CustomHierarchyNode) => {
      const nodes = root.descendants();
      const links = root.links();

      tree(root);

      let i = 0;
      root.eachBefore((d: any) => {
        d.x = i++ * dx;
        d.y = d.depth * dy;
      });

      // Nodes
      const node = gNode.selectAll('g')
        .data(nodes, (d: any) => d.id || (d.id = ++index));

      const nodeEnter = node.enter().append('g')
        .attr('transform', d => `translate(${source.y0},${source.x0})`)
        .on('click', (_, d: CustomHierarchyNode) => {
          d.children = d.children ? undefined : d._children;
          update(d);
        });

      nodeEnter.append('circle')
        .attr('r', 5)
        .attr('fill', d => d._children ? '#f7b731' : '#45aaf2');

      nodeEnter.append('text')
        .attr('dy', '0.31em')
        .attr('x', d => d._children ? -10 : 10)
        .attr('text-anchor', d => d._children ? 'end' : 'start')
        .text(d => d.data.name)
        .clone(true).lower()
        .attr('stroke', 'white');

      (node as any).merge(nodeEnter as any)
        .transition().duration(duration)
        .attr('transform', (d: { y: any; x: any; }) => `translate(${d.y},${d.x})`);

      // Links
      const link = gLink.selectAll('path')
        .data(links, (d: any) => d.target.id);

      link.enter().append('path')
        .attr('d', () => {
          const o = { x: source.x0!, y: source.y0! };
          return diagonal({ source: o, target: o } as any);
        })
        .merge(link as any).transition()
        .duration(duration)
        .attr('d', diagonal as any);

      // Store old positions
      root.each((d: CustomHierarchyNode) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    };

    // Colapsar nodos al inicio
    root.children?.forEach((d: CustomHierarchyNode) => {
      d._children = d.children;
      d.children = undefined;
    });

    update(root);
  }
}