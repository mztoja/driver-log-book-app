import React, { JSX, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

export type MapMarker =
    | { kind: 'place'; id: number; lat: number; lon: number; type: number; partial: boolean }
    | { kind: 'friend'; id: number; lat: number; lon: number; initials: string; onTour: boolean }
    | { kind: 'self'; id: 0; lat: number; lon: number; initials: string; onTour: boolean };

interface Props {
    markers: MapMarker[];
    onMarkerPress: (kind: MapMarker['kind'], id: number) => void;
}

/*
 * Mapa jak na froncie (react-leaflet + OpenStreetMap), osadzona w WebView: te same kafelki,
 * te same ikony SVG (placeMarkerIcon.ts / friendMarkerIcon.ts) i to samo dopasowanie widoku
 * (fitBounds przy zmianie liczby pinezek). Bez klucza Google Maps i działa w Expo Go.
 * RN -> strona: window.__setMarkers(json); strona -> RN: postMessage({kind, id}).
 */
const HTML = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; }
  .pin { background: none; border: none; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  var PLACE_COLORS = { 0: '#9e9e9e', 1: '#2196f3', 2: '#4caf50', 3: '#ff9800', 4: '#009688', 5: '#9c27b0', 6: '#795548', 7: '#f44336', 8: '#ffc107' };
  var FRIEND_COLOR = '#e91e63', SELF_COLOR = '#3f51b5', SIZE = 34;

  function placeSvg(color, partial) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">' +
      '<path fill="' + color + '" stroke="#000000aa" stroke-width="1" ' + (partial ? 'stroke-dasharray="3,1.5"' : '') +
      ' d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z"/>' +
      '<circle cx="12.5" cy="12.5" r="5.5" fill="#ffffffd0"/>' +
      (partial ? '<circle cx="19" cy="6" r="5.5" fill="#ffc107" stroke="#000000aa" stroke-width="0.8"/>' +
        '<text x="19" y="8.5" font-size="8" font-weight="bold" text-anchor="middle" fill="#000000">!</text>' : '') +
      '</svg>';
  }
  function personSvg(color, initials, onTour) {
    var h = SIZE / 2;
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + SIZE + '" height="' + SIZE + '" viewBox="0 0 ' + SIZE + ' ' + SIZE + '">' +
      '<circle cx="' + h + '" cy="' + h + '" r="' + (h - 2) + '" fill="' + color + '" stroke="#ffffff" stroke-width="2"/>' +
      '<text x="' + h + '" y="' + (h + 5) + '" font-size="13" font-weight="bold" text-anchor="middle" fill="#ffffff">' + initials + '</text>' +
      (onTour ? '<circle cx="' + (SIZE - 5) + '" cy="5" r="5.5" fill="#ffc107" stroke="#000000aa" stroke-width="0.8"/>' +
        '<text x="' + (SIZE - 5) + '" y="7.7" font-size="7" font-weight="bold" text-anchor="middle" fill="#000000">T</text>' : '') +
      '</svg>';
  }
  function iconFor(m) {
    if (m.kind === 'place') {
      return L.divIcon({ html: placeSvg(PLACE_COLORS[m.type] || PLACE_COLORS[0], m.partial), className: 'pin', iconSize: [25, 41], iconAnchor: [12, 41] });
    }
    return L.divIcon({ html: personSvg(m.kind === 'self' ? SELF_COLOR : FRIEND_COLOR, m.initials, m.onTour), className: 'pin', iconSize: [SIZE, SIZE], iconAnchor: [SIZE / 2, SIZE / 2] });
  }

  var map = L.map('map', { zoomControl: true }).setView([52, 19], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  var layer = L.layerGroup().addTo(map);
  var lastCount = -1;

  window.__setMarkers = function (markers) {
    layer.clearLayers();
    var positions = [];
    markers.forEach(function (m) {
      positions.push([m.lat, m.lon]);
      L.marker([m.lat, m.lon], { icon: iconFor(m) })
        .on('click', function () { window.ReactNativeWebView.postMessage(JSON.stringify({ kind: m.kind, id: m.id })); })
        .addTo(layer);
    });
    // jak front FitBounds: dopasuj widok, gdy zmieni się liczba pinezek
    if (positions.length > 0 && positions.length !== lastCount) {
      map.fitBounds(positions, { padding: [30, 30], maxZoom: 14 });
    }
    lastCount = positions.length;
  };
  window.ReactNativeWebView.postMessage(JSON.stringify({ kind: 'ready', id: 0 }));
</script>
</body>
</html>`;

export const LeafletMap: React.FC<Props> = ({ markers, onMarkerPress }): JSX.Element => {
    const webRef = useRef<WebView>(null);
    const ready = useRef<boolean>(false);
    const json = useMemo(() => JSON.stringify(markers), [markers]);
    const jsonRef = useRef<string>(json);

    const push = (): void => {
        if (!ready.current) return;
        webRef.current?.injectJavaScript(`window.__setMarkers(${jsonRef.current}); true;`);
    };

    // najnowsze pinezki trzymane w ref – strona może zgłosić gotowość później niż pierwsze dane
    useEffect(() => {
        jsonRef.current = json;
        push();
    }, [json]);

    const onMessage = (e: WebViewMessageEvent): void => {
        try {
            const msg = JSON.parse(e.nativeEvent.data) as { kind: MapMarker['kind'] | 'ready'; id: number };
            if (msg.kind === 'ready') {
                ready.current = true;
                push();
                return;
            }
            onMarkerPress(msg.kind, msg.id);
        } catch {
            // ignorujemy nieznane wiadomości
        }
    };

    return (
        <View style={styles.wrap}>
            <WebView
                ref={webRef}
                originWhitelist={['*']}
                // baseUrl daje stronie origin/Referer – serwery kafelków OSM odrzucają żądania bez niego
                source={{ html: HTML, baseUrl: 'https://mzservices.pl/' }}
                onMessage={onMessage}
                javaScriptEnabled
                domStorageEnabled
                setSupportMultipleWindows={false}
                style={styles.web}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    wrap: { flex: 1, overflow: 'hidden' },
    web: { flex: 1, backgroundColor: 'transparent' },
});
