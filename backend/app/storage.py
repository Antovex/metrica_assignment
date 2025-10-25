import json
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import PyMongoError

from .config import get_settings


class Storage:
    def __init__(self) -> None:
        self._settings = get_settings()
        self._client: Optional[AsyncIOMotorClient] = None
        self._db = None
        self._collection = None
        # fallback file store path
        self._json_path = os.path.join(os.path.dirname(__file__), "..", "data", "submissions.json")

    async def connect(self) -> None:
        try:
            self._client = AsyncIOMotorClient(self._settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
            self._db = self._client[self._settings.DB_NAME]
            self._collection = self._db["submissions"]
            # Trigger server selection once
            await self._db.command("ping")
        except Exception:
            # fallback to file storage
            self._client = None
            self._db = None
            self._collection = None
            os.makedirs(os.path.dirname(self._json_path), exist_ok=True)
            if not os.path.exists(self._json_path):
                with open(self._json_path, "w", encoding="utf-8") as f:
                    json.dump([], f)

    async def close(self) -> None:
        if self._client:
            self._client.close()

    async def insert_submission(self, data: Dict[str, Any]) -> str:
        # Ensure createdAt
        data = {**data, "createdAt": datetime.utcnow()}
        if self._collection is not None:
            try:
                res = await self._collection.insert_one(data)
                return str(res.inserted_id)
            except PyMongoError:
                pass
        # file fallback
        with open(self._json_path, "r", encoding="utf-8") as f:
            arr: List[Dict[str, Any]] = json.load(f)
        new_id = str(len(arr) + 1)
        arr.append({**data, "_id": new_id})
        with open(self._json_path, "w", encoding="utf-8") as f:
            json.dump(arr, f, default=str, indent=2)
        return new_id

    async def update_urls(self, _id: str, has_pdf: bool = False, has_docx: bool = False) -> None:
        """Store only boolean flags, not full URLs (for portability across environments)"""
        if self._collection is not None:
            try:
                # Convert string ID to ObjectId for MongoDB query
                await self._collection.update_one(
                    {"_id": ObjectId(_id)}, 
                    {"$set": {"hasPdf": has_pdf, "hasDocx": has_docx}}
                )
                return
            except (PyMongoError, Exception):
                pass
        # file fallback update
        try:
            with open(self._json_path, "r", encoding="utf-8") as f:
                arr: List[Dict[str, Any]] = json.load(f)
            for item in arr:
                if str(item.get("_id")) == str(_id):
                    item["hasPdf"] = has_pdf
                    item["hasDocx"] = has_docx
                    break
            with open(self._json_path, "w", encoding="utf-8") as f:
                json.dump(arr, f, default=str, indent=2)
        except Exception:
            pass

    async def list_submissions(self) -> List[Dict[str, Any]]:
        if self._collection is not None:
            try:
                cursor = self._collection.find().sort("createdAt", -1)
                results = []
                async for doc in cursor:
                    # Convert ObjectId and datetime to strings, remove _id from response
                    item = {k: v for k, v in doc.items() if k != "_id"}
                    item["id"] = str(doc.get("_id"))
                    if "createdAt" in item and hasattr(item["createdAt"], "isoformat"):
                        item["createdAt"] = item["createdAt"].isoformat()
                    results.append(item)
                return results
            except PyMongoError:
                pass
        # file fallback
        with open(self._json_path, "r", encoding="utf-8") as f:
            arr: List[Dict[str, Any]] = json.load(f)
        # normalize
        normalized: List[Dict[str, Any]] = []
        for item in arr:
            it = {k: v for k, v in item.items() if k != "_id"}
            it["id"] = str(item.get("_id"))
            normalized.append(it)
        normalized.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
        return normalized
