import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ResponsivePieCanvas } from '@nivo/pie';
import { ResponsiveLine } from '@nivo/line';
import AddIcon from '../static/images/add-person-icon.svg';
import DocumentsIcon from '../static/images/documents-icon.svg';
import SignDocumentIcon from '../static/images/sign-document-icon.svg';
import SignDocumentPNG from '../static/images/sign-document.png';
import WorkerPNG from '../static/images/workers.png';
import ClientsPNG from '../static/images/clients.png';

const pieData = [
  {
    id: 'Approved',
    label: 'approved',
    value: 15,
    color: 'HSL(237, 100%, 78%)',
  },
  {
    id: 'Rejected',
    label: 'rejected',
    value: 32,
    color: 'HSL(0, 100%, 77%)',
  },
];

const lineData = [
  {
    id: 'applications',
    color: 'HSL(237, 100%, 78%)',
    data: [
      {
        x: 0,
        y: 2,
      },
      {
        x: 1,
        y: 11,
      },
      {
        x: 2,
        y: 7,
      },
      {
        x: 3,
        y: 27,
      },
      {
        x: 4,
        y: 45,
      },
      {
        x: 5,
        y: 37,
      },
      {
        x: 6,
        y: 24,
      },
      {
        x: 7,
        y: 29,
      },
    ],
  },
];

interface Props {}
interface State {}

class AdminDashboard extends Component<Props, State, {}> {
  MyResponsivePie = () => (
    <ResponsivePieCanvas
      data={pieData}
      margin={{
        top: 0, right: 100, bottom: 0, left: 100,
      }}
      pixelRatio={1.25}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={1}
      colors={(d) => d.color}
      borderColor={{ from: 'color', modifiers: [['darker', 0.6]] }}
      radialLabelsSkipAngle={10}
      radialLabelsTextXOffset={6}
      radialLabelsTextColor="#333333"
      radialLabelsLinkOffset={0}
      radialLabelsLinkDiagonalLength={16}
      radialLabelsLinkHorizontalLength={24}
      radialLabelsLinkStrokeWidth={2}
      radialLabelsLinkColor={{ from: 'color' }}
      slicesLabelsSkipAngle={10}
      slicesLabelsTextColor="#333333"
      animate
      motionStiffness={90}
      motionDamping={15}
      theme={{
        fontSize: '16',
      }}
      legends={[
        {
          anchor: 'bottom',
          direction: 'row',
          translateX: 0,
          itemWidth: 60,
          itemHeight: 25,
          itemsSpacing: 80,
          symbolSize: 20,
          symbolShape: 'circle',
        },
      ]}
    />
  )

  MyResponsiveLine = () => (
    <ResponsiveLine
      data={lineData}
      margin={{
        top: 50, right: 50, bottom: 150, left: 50,
      }}
      xScale={{ type: 'linear' }}
      yScale={{
        type: 'linear', stacked: true, min: 0, max: 60,
      }}
      curve="monotoneX"
      colors={(d) => d.color}
      axisBottom={{
        tickValues: [
          0,
          1,
          2,
          3,
          4,
          5,
          6,
          7,
        ],
        tickSize: 1,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'Days ago',
        legendOffset: 36,
        legendPosition: 'middle',
      }}
      axisLeft={{
        tickValues: [
          0,
          10,
          20,
          30,
          40,
          50,
          60,
        ],
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'Applications',
        legendOffset: -40,
        legendPosition: 'middle',
      }}
      enableGridX={false}
      lineWidth={1.2}
      pointSize={8}
      pointColor={{ theme: 'background' }}
      pointBorderWidth={1}
      pointBorderColor={{ from: 'serieColor' }}
      enablePointLabel={false}
      useMesh
      gridXValues={[0, 1, 2, 3, 4, 5, 6, 7]}
      gridYValues={[0, 10, 20, 30, 40, 50, 60]}
      legends={[
        {
          anchor: 'bottom',
          direction: 'row',
          justify: false,
          translateX: 160,
          translateY: 43,
          itemsSpacing: 2,
          itemDirection: 'left-to-right',
          itemWidth: 80,
          itemHeight: 12,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: 'circle',
          symbolBorderColor: 'rgba(0, 0, 0, .5)',
          effects: [
            {
              on: 'hover',
              style: {
                itemBackground: 'rgba(0, 0, 0, .03)',
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
    />
  )

  render() {
    return (
      <div>
        <Helmet>
          <title>Admin Dashboard</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="container">
          <div className="row pt-5">
            <h3 className="font-weight-bold">Welcome, FIRSTNAME LASTNAME!</h3>
          </div>
          <div className="row py-2">
            <a href="" className="mr-4">
              <img src={AddIcon} className="icon-svg" alt="" />
              {' '}
              Add Worker
            </a>
            <a href="" className="mr-4">
              <img src={AddIcon} className="icon-svg" alt="" />
              {' '}
              Add Client
            </a>
            <a href="" className="mr-4">
              <img src={SignDocumentIcon} className="icon-svg" alt="" />
              {' '}
              Sign Documents
            </a>
            <a href="" className="mr-4">
              <img src={DocumentsIcon} className="icon-svg" alt="" />
              {' '}
              View Apps
            </a>
          </div>
          <div className="row py-3">
            <div className="col-md-4 pl-0">
              <div className="card primary-color-border">
                <div className="row">
                  <div className="col-sm-6 pr-0">
                    <div className="card-body">
                      <h1 className="card-title brand-text">20</h1>
                      <h6 className="card-subtitle mb-2 text-muted">Documents to sign</h6>
                    </div>
                  </div>
                  <div className="col-sm-6 pl-0">
                    <div className="card-body text-right">
                      <h6 className="text-primary-theme font-weight-bold">Sign Document</h6>
                      <img className="w-100" src={SignDocumentPNG} alt="sign document" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4 pl-0">
              <div className="card primary-color-border">
                <div className="row">
                  <div className="col-sm-6 pr-0">
                    <div className="card-body">
                      <h1 className="card-title brand-text">320</h1>
                      <h6 className="card-subtitle mb-2 text-muted">Workers in your Organization</h6>
                    </div>
                  </div>
                  <div className="col-sm-6 pl-0">
                    <div className="card-body text-right">
                      <h6 className="text-primary-theme font-weight-bold">View Workers</h6>
                      <img className="w-100" src={WorkerPNG} alt="workers" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4 pl-0">
              <div className="card primary-color-border">
                <div className="row">
                  <div className="col-sm-6 pr-0">
                    <div className="card-body">
                      <h1 className="card-title brand-text">250</h1>
                      <h6 className="card-subtitle mb-2 text-muted">Clients in your Organization</h6>
                    </div>
                  </div>
                  <div className="col-sm-6 pl-0">
                    <div className="card-body text-right">
                      <h6 className="text-primary-theme font-weight-bold">Sign Document</h6>
                      <img className="w-100" src={ClientsPNG} alt="clients" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row py-3">
            <div className="col-md-6 pl-0">
              <div className="card primary-color-border p-2">
                <div className="row">
                  <div className="col-md-7 pr-0">
                    <div className="card-body pb-0">
                      <h3 className="mb-0 font-weight-bold">Application Status</h3>
                    </div>
                  </div>
                  <div className="col-md-5 pl-0 text-right">
                    <div className="card-body pb-0">
                      <h6 className="text-primary-theme font-weight-bold">Sign Document</h6>
                    </div>
                  </div>
                </div>
                <div className="pie-chart-dimensions w-100 px-3 mt-n4">
                  {this.MyResponsivePie()}
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card primary-color-border p-2">
                <div className="row">
                  <div className="card-body pb-0">
                    <h3 className="mb-0 font-weight-bold">Applications Submitted Daily</h3>
                  </div>
                </div>
                <div className="pie-chart-dimensions w-100 px-3 mt-n4">
                  {this.MyResponsiveLine()}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    );
  }
}

export default AdminDashboard;
