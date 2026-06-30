import React, { useEffect, useState } from 'react';
import { Typography, Select, Spin, Card, Space, Tag, Row, Col } from 'antd';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { priceService } from '../services/api';

const { Title, Text } = Typography;

interface ProductMapData {
  productId: string;
  productName: string;
  category: string;
  unit: string;
  officialPrice: number;
  avgReportedPrice: number | null;
  difference: number | null;
  percentDiff: number | null;
  reportCount: number;
  lastReportDate: string | null;
}

interface MarketMapData {
  marketId: string;
  marketName: string;
  city: string;
  latitude: number;
  longitude: number;
  products: ProductMapData[];
}



function createColoredIcon(color: string) {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
      <path d="M12 0C7.58 0 4 3.58 4 8c0 5.4 7 11 8 11.5S20 13.4 20 8c0-4.42-3.58-8-8-8z" fill="${color}" stroke="#fff" stroke-width="1.5"/>
      <circle cx="12" cy="8" r="3" fill="#fff"/>
    </svg>`;

  return L.divIcon({
    html: svgIcon,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });
}

function getMarkerColor(percentDiff: number | null): string {
  if (percentDiff === null) return '#9E9E9E';
  if (percentDiff <= 5) return '#00853F';
  if (percentDiff <= 15) return '#FCD116';
  if (percentDiff <= 30) return '#FF9800';
  return '#E31B23';
}

function formatPrice(price: number | null): string {
  if (price === null) return 'N/A';
  return `${price.toLocaleString()} CFA`;
}

function MapBounds({ mapData }: { mapData: MarketMapData[] }) {
  const map = useMap();
  useEffect(() => {
    if (mapData.length > 0) {
      const bounds = L.latLngBounds(
        mapData.map(m => [m.latitude, m.longitude] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [mapData, map]);
  return null;
}

const productNames: Record<string, string> = {
  'Riz brisé ordinaire importé': 'Riz brisé ordinaire',
  'Riz brisé non parfumé': 'Riz brisé non parfumé',
  'Huile de palme raffinée': 'Huile de palme',
  'Sucre cristallisé': 'Sucre cristallisé',
  'Farine de blé type 55': 'Farine de blé',
  'Lait en poudre': 'Lait en poudre',
  'Gaz butane 6kg': 'Gaz butane 6kg',
  'Gaz butane 12kg': 'Gaz butane 12kg'
};

function getShortName(name: string): string {
  return productNames[name] || name;
}

const MapView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [mapData, setMapData] = useState<MarketMapData[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('all');

  useEffect(() => {
    fetchMapData();
  }, []);

  const fetchMapData = async () => {
    try {
      setLoading(true);
      const response = await priceService.getMapData();
      if (response.data.success) {
        setMapData(response.data.mapData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données cartographiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const uniqueProducts = React.useMemo(() => {
    if (mapData.length === 0) return [];
    const seen = new Set<string>();
    const result: { id: string; name: string }[] = [];
    mapData.forEach(market => {
      market.products.forEach(p => {
        if (!seen.has(p.productId)) {
          seen.add(p.productId);
          result.push({ id: p.productId, name: p.productName });
        }
      });
    });
    return result;
  }, [mapData]);

  const getProductData = (market: MarketMapData) => {
    if (selectedProduct === 'all') {
      const withDiff = market.products.filter(p => p.avgReportedPrice !== null);
      const avgDiff = withDiff.length > 0
        ? withDiff.reduce((sum, p) => sum + (p.percentDiff || 0), 0) / withDiff.length
        : null;
      return {
        avgDiff,
        allProducts: market.products,
        hasData: withDiff.length > 0
      };
    }
    const product = market.products.find(p => p.productId === selectedProduct);
    return {
      avgDiff: product?.percentDiff ?? null,
      allProducts: product ? [product] : [],
      hasData: product?.avgReportedPrice !== null
    };
  };

  const center: [number, number] = [14.5, -14.5];

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <Title level={2}>Carte des écarts de prix</Title>
        <Text type="secondary">
          Visualisez les écarts entre les prix officiels et les prix signalés sur les marchés
        </Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>Filtrer par produit :</Text>
            <Select
              value={selectedProduct}
              onChange={setSelectedProduct}
              style={{ width: '100%' }}
              options={[
                { value: 'all', label: 'Tous les produits (moyenne)' },
                ...uniqueProducts.map(p => ({
                  value: p.id,
                  label: p.name
                }))
              ]}
            />
          </Space>
        </Col>
        <Col xs={24} md={12}>
          <Card size="small">
            <Space wrap>
              <Tag color="#9E9E9E">Aucune donnée</Tag>
              <Tag color="#00853F">&le; 5% écart</Tag>
              <Tag color="#FCD116">&le; 15% écart</Tag>
              <Tag color="#FF9800">&le; 30% écart</Tag>
              <Tag color="#E31B23">&gt; 30% écart</Tag>
            </Space>
          </Card>
        </Col>
      </Row>

      <div style={{ height: '600px', width: '100%', borderRadius: 8, overflow: 'hidden' }}>
        <MapContainer
          center={center}
          zoom={7}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapBounds mapData={mapData} />
          {mapData.map(market => {
            const { avgDiff, allProducts, hasData } = getProductData(market);
            const markerColor = getMarkerColor(avgDiff);
            const icon = createColoredIcon(markerColor);

            return (
              <Marker
                key={market.marketId}
                position={[market.latitude, market.longitude]}
                icon={icon}
              >
                <Popup>
                  <div style={{ maxWidth: 300 }}>
                    <Title level={5} style={{ margin: 0 }}>{market.marketName}</Title>
                    <Text type="secondary">{market.city}</Text>

                    {!hasData && (
                      <div style={{ marginTop: 8, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
                        <Text type="secondary">Aucun prix signalé pour ce marché</Text>
                      </div>
                    )}

                    {selectedProduct === 'all' ? (
                      allProducts.filter(p => p.avgReportedPrice !== null).length > 0 ? (
                        <div style={{ marginTop: 8 }}>
                          <Text strong>Moyenne des écarts : </Text>
                          <Text style={{ color: markerColor }}>
                            {avgDiff !== null ? `${avgDiff > 0 ? '+' : ''}${avgDiff.toFixed(1)}%` : 'N/A'}
                          </Text>
                          <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 4 }}>
                            {allProducts.filter(p => p.avgReportedPrice !== null).map(p => (
                              <div key={p.productId} style={{
                                padding: '4px 0',
                                borderBottom: '1px solid #f0f0f0',
                                fontSize: 12
                              }}>
                                <div><strong>{getShortName(p.productName)}</strong></div>
                                <div>
                                  Officiel: {formatPrice(p.officialPrice)} | 
                                  Signalé: {formatPrice(p.avgReportedPrice)}
                                </div>
                                {p.percentDiff !== null && (
                                  <div style={{ color: getMarkerColor(p.percentDiff) }}>
                                    Écart: {p.percentDiff > 0 ? '+' : ''}{p.percentDiff}%
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null
                    ) : (
                      allProducts.map(p => (
                        <div key={p.productId} style={{ marginTop: 8 }}>
                          <Text strong>{getShortName(p.productName)}</Text>
                          <div style={{ marginTop: 4 }}>
                            <div>
                              <Text>Prix officiel : </Text>
                              <Text strong style={{ color: '#00853F' }}>{formatPrice(p.officialPrice)}</Text>
                            </div>
                            <div>
                              <Text>Prix signalé (moy.) : </Text>
                              <Text strong>{formatPrice(p.avgReportedPrice)}</Text>
                            </div>
                            {p.percentDiff !== null && (
                              <div>
                                <Text>Écart : </Text>
                                <Text strong style={{ color: getMarkerColor(p.percentDiff) }}>
                                  {p.percentDiff > 0 ? '+' : ''}{p.percentDiff}%
                                  {' '}({p.difference !== null ? `${p.difference > 0 ? '+' : ''}${p.difference} CFA` : 'N/A'})
                                </Text>
                              </div>
                            )}
                            <div>
                              <Text type="secondary">
                                {p.reportCount} signalement{p.reportCount > 1 ? 's' : ''}
                              </Text>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView;
