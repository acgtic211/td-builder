import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { TdService } from '../../services/td/td.service';
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

    if (Array.isArray(obj)) {
      obj.forEach((value, i) => {
        if (value !== null && typeof value === 'object') {
          children.push(this.buildHierarchy(value, `[${i}]`));
        } else {
          children.push({ name: `[${i}]: ${value}` });
        }
      });
    } else if (obj !== null && typeof obj === 'object') {
      Object.entries(obj).forEach(([key, value]) => {
        if (value !== null && typeof value === 'object') {
          children.push(this.buildHierarchy(value, key));
        } else {
          children.push({ name: `${key}: ${value}` });
        }
      });
    }

    return { name, children: children.length > 0 ? children : undefined };
  }

  renderTree(data: any) {
    const dx = 30;
    const dy = 180;
    const duration = 400;

    const root: CustomHierarchyNode = d3.hierarchy(data) as CustomHierarchyNode;
    root.x0 = 0;
    root.y0 = 0;

    let index = 0;

    const svg = d3.select(this.container.nativeElement)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
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

    function collapse(d: CustomHierarchyNode) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = undefined;
      }
    }

    const update = (source: CustomHierarchyNode) => {
      const nodes = root.descendants();
      const links = root.links();

      let i = 0;
      root.eachBefore((d: CustomHierarchyNode) => {
        d.x = i++ * dx;
        d.y = d.depth * dy;
      });

      const height = i * dx + 100;
      const width = (root.height + 2) * dy;

      svg.transition().duration(duration).attr('viewBox', [
        -dy,
        -dx,
        width,
        height
      ].join(','));

      // Nodes
      const node = gNode.selectAll('g')
        .data(nodes, (d: any) => d.id || (d.id = ++index));

      const nodeEnter = node.enter().append('g')
        .attr('transform', d => `translate(${source.y0},${source.x0})`)
        .on('click', (_, d: CustomHierarchyNode) => {
          if (d.children) {
            d._children = d.children;
            d.children = undefined;
          } else {
            d.children = d._children;
            d._children = undefined;
          }
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

      const nodeUpdate = nodeEnter.merge(node as any)
        .transition().duration(duration)
        .attr('transform', d => `translate(${d.y},${d.x})`);

      const nodeExit = node.exit().transition().duration(duration)
        .attr('transform', d => `translate(${source.y},${source.x})`)
        .remove();

      nodeExit.select('circle').attr('r', 0);
      nodeExit.select('text').style('fill-opacity', 0);

      // Links
      const link = gLink.selectAll('path')
        .data(links, (d: any) => d.target.id);

      const linkEnter = link.enter().append('path')
        .attr('d', () => {
          const o = { x: source.x0!, y: source.y0! };
          return diagonal({ source: o, target: o } as any);
        });

      linkEnter.merge(link as any).transition()
        .duration(duration)
        .attr('d', diagonal as any);

      link.exit().transition().duration(duration)
        .attr('d', () => {
          const o = { x: source.x!, y: source.y! };
          return diagonal({ source: o, target: o } as any);
        })
        .remove();

      // Store old positions
      root.each(d => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    };

    // Colapsar nodos al inicio
    root.children?.forEach(collapse);
    update(root);
  }
}