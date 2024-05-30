import { BadRequestException, Injectable } from '@nestjs/common';
import { JSDOM } from 'jsdom';
import { CheckInDto, CheckInType } from './app.dto';

const trustedLocations = {
  key: 'TRUSTED_LOCATIONS',
  value: [
    { latitude: 10.8040889, longitude: 106.748192 },
    { latitude: 21.0383319, longitude: 105.8059691 },
    { latitude: 21.1037182, longitude: 105.9347499 },
    { latitude: 20.975070949926874, longitude: 105.77667236004596 },
  ],
};

const trustedIPS = {
  key: 'TRUSTED_IPS',
  value: ['192.168.1.1', '192.168.1.2', '::1', '::ffff:127.0.0.1'],
};

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  checkLocation(latitude?: number, longitude?: number) {
    if (latitude && longitude) {
      return this.showPosition({
        coords: {
          latitude,
          longitude,
        },
      });
    } else {
      // Tạo một JSDOM mới
      const dom = new JSDOM(
        `<!DOCTYPE html><html><head><title>My Document</title></head><body></body></html>`,
      );

      // Lấy đối tượng window từ JSDOM
      const window = dom.window;

      // Lấy đối tượng navigator từ window
      const navigator = window.navigator;
      if (navigator.geolocation) {
        return navigator.geolocation.getCurrentPosition(
          this.showPosition,
          this.showError,
        );
      } else {
        console.log('Trình duyệt của bạn không hỗ trợ Geolocation API');
        const position = {
          coords: {
            latitude: 10.826871,
            longitude: 106.610578,
            accuracy: 20,
            timestamp: 1659385123456,
          },
          // ... các thuộc tính khác của position
        };
        return this.showPosition(position);
      }
    }
  }

  // Hiển thị vị trí người dùng
  showPosition(position) {
    const userLatitude = position.coords.latitude;
    const userLongitude = position.coords.longitude;
    console.log(
      `Vị trí người dùng: Latitude: ${userLatitude}, Longitude: ${userLongitude}`,
    );

    // Xác định vị trí gần nhất
    let closestTrustedLocation = null;
    let shortestDistance = 0.5; // Infinity;
    for (const trustedLocation of trustedLocations.value) {
      const distance = this.calculateDistance(
        userLatitude,
        userLongitude,
        trustedLocation.latitude,
        trustedLocation.longitude,
      );
      console.log({ distance });

      if (distance < shortestDistance) {
        shortestDistance = distance;
        closestTrustedLocation = trustedLocation;
      }
    }
    // Ghi nhận sự hiện diện của người dùng
    if (closestTrustedLocation) {
      console.log(
        `Vị trí gần nhất: Latitude: ${closestTrustedLocation.latitude}, Longitude: ${closestTrustedLocation.longitude}`,
      );
      return this.checkInByLocations(userLatitude, userLongitude);
    } else {
      throw new Error('Không tìm thấy vị trí tin cậy nào gần');
    }
  }

  // Hàm tính toán khoảng cách giữa hai điểm sử dụng công thức Haversine
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Bán kính Trái đất (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance; // don vi là km
  }

  // Ghi nhận sự hiện diện của người dùng
  checkInByLocations(latitude, longitude) {
    // Lưu trữ thông tin trong cơ sở dữ liệu hoặc gửi yêu cầu đến máy chủ
    return {
      message: 'Người dùng đã check in thành công',
      data: { latitude, longitude },
    };
  }

  // Hiển thị lỗi
  showError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        throw new Error('Bạn đã từ chối chia sẻ vị trí của mình');
        break;
      case error.POSITION_UNAVAILABLE:
        throw new Error('Vị trí của bạn không khả dụng');
        break;
      case error.TIMEOUT:
        throw new Error('Yêu cầu lấy vị trí bị hết thời gian');
        break;
      default:
        throw new Error('Lỗi không xác định');
    }
  }

  checkIPS(ip: string) {
    if (trustedIPS.value.includes(ip)) {
      return {
        message: 'Người dùng đã check in thành công',
        data: { ip },
      };
    } else {
      throw new Error('địa chỉ ip không hợp lệ');
    }
  }

  checkIn(ip: string, data: CheckInDto) {
    try {
      if (data.type == CheckInType.IPS) {
        return this.checkIPS(ip);
      } else {
        return this.checkLocation(data?.latitude, data?.longitude);
      }
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }
}
